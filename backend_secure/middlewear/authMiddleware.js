const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = async (req, res, next) => {
    try {
        let token;

        // Prefer the httpOnly cookie (set by our own login/register).
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        } else if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            // Kept for compatibility with any non-browser API clients.
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not Authorized, Token Missing"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select("-password -resetOtp -resetOtpExpiry +activeSessions");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User Not Found"
            });
        }

        // Valid only if this token's session ID is still one of the
        // account's currently active sessions (up to MAX_ACTIVE_SESSIONS
        // devices at once - see utils/sessionLimit.js). It stops being
        // valid if that slot's TTL passed or the device logged out, even
        // though the JWT itself isn't expired yet.
        const now = Date.now();
        const hasValidSession = (user.activeSessions || []).some(
            (s) => s.sessionId === decoded.sessionId && s.expiresAt > now
        );

        if (!decoded.sessionId || !hasValidSession) {
            return res.status(401).json({
                success: false,
                message: "Your session has expired or was signed out. Please log in again."
            });
        }

        if (user.isActive === false) {
            return res.status(403).json({
                success: false,
                message: "This account has been disabled. Contact support."
            });
        }

        req.sessionId = decoded.sessionId;
        req.user = user;
        next();
    }

    catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired session. Please log in again."
        });
    }
};

module.exports = protect;