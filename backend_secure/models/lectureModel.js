const mongoose = require("mongoose");

const lectureSchema = new mongoose.Schema(

    {

        lectureTitle: {

            type: String,

            required: true,

            trim: true

        },

        lectureNumber: {

            type: Number,

            required: true

        },

        description: {

            type: String,

            default: ""

        },

        videoUrl: {

            type: String,

            required: true

        },

        pdfUrl: {

            type: String,

            default: ""

        },

        duration: {

            type: String,

            default: ""

        },

        isDemo: {

            type: Boolean,

            default: false

        },

        chapterId: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "Chapter",

            required: true

        }

    },

    {

        timestamps: true

    }

);

module.exports = mongoose.model("Lecture", lectureSchema);