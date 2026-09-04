const mongoose = require("mongoose");
const Purchase = require("../models/purchaseModel");
const Subject = require("../models/subjectModel");
const razorpay = require("../config/rozorPay");
const crypto = require("crypto");

// CREATE RAZORPAY ORDER
const purchaseSubject = async (req, res) => {
    try {
        const { subjectId } = req.body;
        const studentId = req.user._id;

        if (!subjectId) {
            return res.status(400).json({
                success: false,
                message: "Subject ID is required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(subjectId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Subject ID"
            });
        }

        const subject = await Subject.findById(subjectId);
        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Subject Not Found"
            });
        }

        // Check Already Purchased (Success)
        const alreadyPurchased = await Purchase.findOne({
            studentId,
            subjectId,
            paymentStatus: "Success"
        });
        if (alreadyPurchased) {
            return res.status(400).json({
                success: false,
                message: "Subject already purchased"
            });
        }

        const amount = Math.round(subject.price * 100);
        const options = {
            amount,
            currency: "INR",
            receipt: `rcpt_${studentId.toString().slice(-6)}_${Date.now()}`
        };
        const order = await razorpay.orders.create(options);

        // Reuse existing Pending/Failed purchase doc for this student+subject,
        // or create one if it doesn't exist yet — avoids the unique index
        // (studentId + subjectId) throwing E11000 on retry.
        const purchase = await Purchase.findOneAndUpdate(
            { studentId, subjectId },
            {
                studentId,
                subjectId,
                amount: subject.price,
                paymentStatus: "Pending",
                razorpayOrderId: order.id,
                razorpayPaymentId: "",
                razorpaySignature: ""
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.status(201).json({
            success: true,
            message: "Razorpay Order Created Successfully",
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            purchaseId: purchase._id,
            keyId: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.log("CREATE RAZORPAY ORDER ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create payment order"
        });
    }
};
// VERIFY RAZORPAY PAYMENT
const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            purchaseId
        } = req.body;
        // Check required data
        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature ||
            !purchaseId
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment verification data is incomplete"
            });
        }
        // Find Purchase
        const purchase = await Purchase.findById(purchaseId);
        if (!purchase) {
            return res.status(404).json({
                success: false,
                message: "Purchase Not Found"
            });
        }
        // Verify Order belongs to this purchase
        if (purchase.razorpayOrderId !== razorpay_order_id) {
            return res.status(400).json({
                success: false,
                message: "Invalid Razorpay Order"
            });
        }
        // Generate Signature
        const generatedSignature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(
                `${purchase.razorpayOrderId}|${razorpay_payment_id}`
            )
            .digest("hex");
        // Compare Signature
        if (generatedSignature !== razorpay_signature) {
            purchase.paymentStatus = "Failed";
            await purchase.save();
            return res.status(400).json({
                success: false,
                message: "Payment verification failed"
            });
        }
        // Payment Successful
        purchase.paymentStatus = "Success";
        purchase.razorpayPaymentId = razorpay_payment_id;
        purchase.razorpaySignature = razorpay_signature;
        purchase.purchaseDate = new Date();
        await purchase.save();
        res.status(200).json({
            success: true,
            message: "Payment Verified Successfully",
            purchase
        });
    }
    catch (error) {
        console.log("PAYMENT VERIFICATION ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Payment verification failed"
        });
    }
};

// GET MY PURCHASES
const getMyPurchases = async (req, res) => {
    try {
        const studentId = req.user._id;
        const purchases = await Purchase.find({
            studentId,
            paymentStatus: "Success"
        })
            .populate(
                "subjectId",
                "subjectName semester description price thumbnail"
            )
            .sort({
                createdAt: -1
            });
        res.status(200).json({
            success: true,
            count: purchases.length,
            purchases
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// GET ALL PURCHASES - ADMIN
const getAllPurchases = async (req, res) => {
    try {
        const purchases = await Purchase.find()
            .populate(
                "studentId",
                "name email phone"
            )
            .populate(
                "subjectId",
                "subjectName semester"
            )
            .sort({
                createdAt: -1
            });
        res.status(200).json({
            success: true,
            count: purchases.length,
            purchases
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// GET SINGLE PURCHASE
const getSinglePurchase = async (req, res) => {
    try {
        const purchase = await Purchase.findById(req.params.id)
            .populate("studentId", "name email phone")
            .populate("subjectId", "subjectName semester description price thumbnail");

        if (!purchase) {
            return res.status(404).json({
                success: false,
                message: "Purchase Not Found"
            });
        }

        // Ownership check: only the purchasing student or an admin can view this
        const isOwner = purchase.studentId._id.toString() === req.user._id.toString();
        const isAdmin = req.user.role === "admin"; // adjust field name to match your user schema

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to view this purchase"
            });
        }

        res.status(200).json({
            success: true,
            purchase
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};
// EXPORTS
module.exports = {
    purchaseSubject,
    verifyPayment,
    getMyPurchases,
    getAllPurchases,
    getSinglePurchase
};