const jwt = require("jsonwebtoken");

// sessionId is embedded in the token and checked against the user's
// activeSessionId on every request (see authMiddleware) - this is what
// makes a new login on another device invalidate the old one.
const generateToken = (userId, sessionId) => {
    return jwt.sign(
        { id: userId, sessionId },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "7d"
        }
    );
};

module.exports = generateToken;