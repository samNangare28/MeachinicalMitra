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

        // Holds a random ID minted at each successful login. Every request
        // checks the JWT's embedded session ID against this value - a new
        // login overwrites it, which instantly invalidates any session
        // still logged in elsewhere, enforcing "one active device at a time".
        activeSessionId: {
            type: String,
            default: null,
            select: false
        },

        // Devices that have already completed email verification once.
        // Login from a hash in this list skips the OTP challenge; login
        // from any other device triggers it. Each entry expires after 30
        // days so a lost/old device doesn't stay trusted forever.
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

        // Set while a login from an unrecognized device is waiting on the
        // emailed OTP. Cleared as soon as it's verified (or superseded by
        // a fresh login attempt).
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