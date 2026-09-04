const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(

    {

        subjectName: {

            type: String,

            required: true,

            trim: true

        },

        semester: {

            type: Number,

            required: true,

            min: 1,

            max: 6

        },

        description: {

            type: String,

            required: true,

            trim: true

        },

        price: {

            type: Number,

            required: true,

            default: 0

        },

        thumbnail: {

            type: String,

            default: ""

        },

        isPublished: {

            type: Boolean,

            default: false

        },

        createdBy: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "User",

            required: true

        }

    },

    {

        timestamps: true

    }

);

module.exports = mongoose.model("Subject", subjectSchema);