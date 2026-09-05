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

        const user = await User.findById(decoded.id).select("-password -resetOtp -resetOtpExpiry +activeSessionId");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User Not Found"
            });
        }

        // If this token's session ID doesn't match the one currently on
        // file, the account has since logged in elsewhere (or logged out)
        // and this token is stale - reject it even though it's not
        // technically expired yet. This is what enforces "one device at a
        // time": a fresh login always wins over any older session.
        if (!decoded.sessionId || decoded.sessionId !== user.activeSessionId) {
            return res.status(401).json({
                success: false,
                message: "You have been logged out because this account was signed in on another device."
            });
        }

        if (user.isActive === false) {
            return res.status(403).json({
                success: false,
                message: "This account has been disabled. Contact support."
            });
        }

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
