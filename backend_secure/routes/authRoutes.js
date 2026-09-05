const express = require("express");

const router = express.Router();

const {
    registerUser,
    loginUser,
    verifyDeviceLogin,
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
    verifyDeviceValidators,
    forgotPasswordValidators,
    resetPasswordValidators
} = require("../middlewear/validators");

router.post("/register", authLimiter, registerValidators, registerUser);
router.post("/login", authLimiter, loginValidators, loginUser);
router.post("/verify-device", otpLimiter, verifyDeviceValidators, verifyDeviceLogin);
router.post("/logout", protect, logoutUser);
router.get("/me", protect, getMe);
router.post("/forgot-password", otpLimiter, forgotPasswordValidators, forgotPassword);
router.post("/reset-password", otpLimiter, resetPasswordValidators, resetPassword);

module.exports = router;