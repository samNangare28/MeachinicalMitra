const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(

    {

        studentId: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "User",

            required: true

        },

        subjectId: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "Subject",

            required: true

        },

        amount: {

            type: Number,

            required: true

        },

        paymentStatus: {

            type: String,

            enum: ["Pending", "Success", "Failed"],

            default: "Pending"

        },

        purchaseDate: {

            type: Date,

            default: Date.now

        },
        razorpayOrderId: {
            type: String,
            default: ""
        },

        razorpayPaymentId: {
            type: String,
            default: ""
        },

        razorpaySignature: {
            type: String,
            default: ""
        },

    },

    {

        timestamps: true

    }

);

// Prevent duplicate purchase of same subject
purchaseSchema.index(
    { studentId: 1, subjectId: 1 },
    { unique: true }
);

module.exports = mongoose.model("Purchase", purchaseSchema);