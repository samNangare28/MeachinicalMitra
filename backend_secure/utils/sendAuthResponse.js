const crypto = require("crypto");
const generateToken = require("./generateToken");
const { authCookieOptions } = require("./cookieOptions");
const { reserveSessionSlot, MAX_ACTIVE_SESSIONS } = require("./sessionLimit");

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // keep in sync with JWT expiry

// Issues the JWT as an httpOnly cookie (never exposed to JS, so an XSS bug
// elsewhere in the app can't be used to steal the session) and returns the
// safe subset of user fields in the JSON body.
//
// Enforces the max-concurrent-sessions cap itself: if this device doesn't
// already hold one of the account's slots and all slots are full, this
// sends a 403 refusal instead of a success response, and the caller
// doesn't need any extra logic either way - just await this and return.
//
// `deviceHash` identifies which device is logging in (see deviceHash.js) -
// pass null if the caller has no device tracking for this session.
// `extra` lets a caller merge extra fields into a successful JSON response.
const sendAuthResponse = async (res, statusCode, user, message, extra = {}, deviceHash = null) => {
    const sessionId = crypto.randomBytes(24).toString("hex");
    const expiresAt = Date.now() + SESSION_TTL_MS;

    const { allowed, sessions } = reserveSessionSlot(user.activeSessions, deviceHash, sessionId, expiresAt);

    if (!allowed) {
        return res.status(403).json({
            success: false,
            message: `You're already logged in on ${MAX_ACTIVE_SESSIONS} devices. Please log out from one of them before logging in here.`
        });
    }

    user.activeSessions = sessions;
    await user.save();

    const token = generateToken(user._id, sessionId);

    res.cookie("token", token, authCookieOptions());

    res.status(statusCode).json({
        success: true,
        message,
        ...extra,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role
        }
    });
};

module.exports = sendAuthResponse;