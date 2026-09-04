const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema(

    {

        chapterName: {

            type: String,

            required: true,

            trim: true

        },

        chapterNumber: {

            type: Number,

            required: true,

            min: 1

        },

        description: {

            type: String,

            default: "",

            trim: true

        },

        subjectId: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "Subject",

            required: true

        },

        isPublished: {

            type: Boolean,

            default: true

        }

    },

    {

        timestamps: true

    }

);

// Prevent duplicate chapter numbers in the same subject

chapterSchema.index(

    {

        subjectId: 1,

        chapterNumber: 1

    },

    {

        unique: true

    }

);

module.exports = mongoose.model("Chapter", chapterSchema);