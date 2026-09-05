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
        }

    },

    {

        timestamps: true

    }

);

module.exports = mongoose.model("User", userSchema);