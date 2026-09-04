const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");

const {
    purchaseSubject,
    verifyPayment,
    getMyPurchases,
    getAllPurchases,
    getSinglePurchase
} = require("../controllers/purchaseController");

const protect = require("../middlewear/authMiddleware");
const adminOnly = require("../middlewear/adminMiddleware");

// Basic ObjectId validator to reject malformed IDs before hitting DB
const validateObjectId = (paramName) => (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params[paramName])) {
        return res.status(400).json({
            success: false,
            message: `Invalid ${paramName}`
        });
    }
    next();
};

// Rate limit order creation to prevent abuse / spam order generation
const purchaseLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 20, // 20 order attempts per window per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many purchase attempts. Please try again later."
    }
});

// Slightly stricter limiter for verify endpoint (prevents signature brute-forcing)
const verifyLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many verification attempts. Please try again later."
    }
});

// CREATE order
router.post("/", protect, purchaseLimiter, purchaseSubject);

// VERIFY payment
router.post("/verify", protect, verifyLimiter, verifyPayment);

// GET own purchases
router.get("/my", protect, getMyPurchases);

// GET all purchases — admin only
router.get("/", protect, adminOnly, getAllPurchases);

// GET single purchase — must own it, or be admin (enforced in controller)
router.get("/:id", protect, validateObjectId("id"), getSinglePurchase);

module.exports = router;