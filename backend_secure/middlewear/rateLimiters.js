const rateLimit = require("express-rate-limit");

// General safety net across the whole API.
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests. Please slow down." }
});

// Auth endpoints are the highest-value brute-force target, so they get a
// much tighter limit than the rest of the API.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: { success: false, message: "Too many attempts. Please try again in a few minutes." }
});

const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many OTP requests. Please try again later." }
});

module.exports = { globalLimiter, authLimiter, otpLimiter };
