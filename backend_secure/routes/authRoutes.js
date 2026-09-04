const express = require("express");

const router = express.Router();

const {
    registerUser,
    loginUser,
    logoutUser,
    getMe,
    forgotPassword,
    resetPassword
} = require("../controllers/authController");

const protect = require("../middlewear/authMiddleware");
const { authLimiter, otpLimiter } = require("../middlewear/rateLimiters");
const {
    registerValidators,
    loginValidators,
    forgotPasswordValidators,
    resetPasswordValidators
} = require("../middlewear/validators");

router.post(
    "/register",
    (req, res, next) => {
        console.log("🔥 REGISTER REQUEST REACHED AUTH ROUTE");
        console.log("BODY:", req.body);
        next();
    },
    authLimiter,
    registerValidators,
    registerUser
);
router.post(
    "/login",
    (req, res, next) => {
        console.log("🔥 LOGIN REQUEST REACHED AUTH ROUTE");
        console.log("BODY:", {
            email: req.body?.email,
            passwordReceived: !!req.body?.password
        });
        next();
    },
    authLimiter,
    loginValidators,
    loginUser
);
router.post("/logout", protect, logoutUser);
router.get("/me", protect, getMe);
router.post("/forgot-password", otpLimiter, forgotPasswordValidators, forgotPassword);
router.post("/reset-password", otpLimiter, resetPasswordValidators, resetPassword);

module.exports = router;
