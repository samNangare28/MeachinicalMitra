const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(

    {

        name: {

            type: String,

            required: true,

            trim: true

        },

        email: {

            type: String,

            required: true,

            unique: true,

            lowercase: true,

            trim: true

        },

        password: {

            type: String,

            required: true

        },

        phone: {

            type: String,

            required: true,

            unique: true,

            trim: true

        },

        role: {

            type: String,

            enum: ["student", "admin"],

            default: "student"

        },

        profileImage: {

            type: String,

            default: ""

        },

        isActive: {

            type: Boolean,

            default: true

        },
        resetOtp: {
            type: String,
            default: null
        },
        resetOtpExpiry: {
            type: Date,
            default: null
        },

        activeSessionId: {
            type: String,
            default: null,
            select: false
        },

        trustedDevices: {
            type: [
                {
                    deviceHash: { type: String, required: true },
                    expiresAt: { type: Date, required: true }
                }
            ],
            default: [],
            select: false
        },


        pendingDeviceOtp: {
            type: String,
            default: null,
            select: false
        },
        pendingDeviceOtpExpiry: {
            type: Date,
            default: null,
            select: false
        },
        pendingDeviceHash: {
            type: String,
            default: null,
            select: false
        }

    },

    {

        timestamps: true

    }

);

module.exports = mongoose.model("User", userSchema);