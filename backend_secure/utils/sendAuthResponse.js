const crypto = require("crypto");
const generateToken = require("./generateToken");
const { authCookieOptions } = require("./cookieOptions");

// Issues the JWT as an httpOnly cookie (never exposed to JS, so an XSS bug
// elsewhere in the app can't be used to steal the session) and returns the
// safe subset of user fields in the JSON body.
//
// Also mints a fresh activeSessionId and saves it on the user document.
// Since the JWT carries this same ID and every request re-checks it
// against the DB, logging in here immediately invalidates any token
// issued by a previous login elsewhere - enforcing one active device.
//
// `extra` lets a caller (e.g. loginUser) merge extra fields into the JSON
// response, such as flagging that this login just signed another device out.
const sendAuthResponse = async (res, statusCode, user, message, extra = {}) => {
    const sessionId = crypto.randomBytes(24).toString("hex");
    user.activeSessionId = sessionId;
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