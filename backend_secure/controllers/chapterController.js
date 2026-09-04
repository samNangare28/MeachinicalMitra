const Chapter = require("../models/chapterModel");

// Never spread req.body directly into an update — whitelist what an
// admin is actually allowed to change.
const ALLOWED_FIELDS = ["chapterName", "chapterNumber", "description", "subjectId", "isPublished"];
const pickAllowedFields = (body) => {
    const data = {};
    for (const key of ALLOWED_FIELDS) {
        if (body[key] !== undefined) data[key] = body[key];
    }
    return data;
};

// Create Chapter

const createChapter = async (req, res) => {
    try {
        const {
            chapterName,
            chapterNumber,
            description,
            subjectId,
            isPublished
        } = req.body;

        // Required Fields
        if (
            !chapterName ||
            !chapterNumber ||
            !subjectId
        ) {
            return res.status(400).json({
                success: false,
                message: "All required fields are mandatory"
            });
        }

        // Check Duplicate Chapter Number

        const existingChapter = await Chapter.findOne({
            subjectId,
            chapterNumber
        });
        if (existingChapter) {
            return res.status(400).json({
                success: false,
                message: "Chapter already exists"
            });
        }
        // Create Chapter
        const chapter = await Chapter.create({
            chapterName,
            chapterNumber,
            description,
            subjectId,
            isPublished
        });
        res.status(201).json({
            success: true,
            message: "Chapter Created Successfully",
            chapter
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

// Get All Chapters

const getAllChapters = async (req, res) => {
    try {
        const chapters = await Chapter.find()
            .populate("subjectId", "subjectName semester")
            .sort({
                chapterNumber: 1
            });
        res.status(200).json({
            success: true,
            count: chapters.length,
            chapters
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
// Get Single Chapter

const getSingleChapter = async (req, res) => {

    try {

        const chapter = await Chapter.findById(req.params.id)

            .populate("subjectId", "subjectName semester");

        if (!chapter) {

            return res.status(404).json({

                success: false,

                message: "Chapter Not Found"

            });

        }

        res.status(200).json({

            success: true,

            chapter

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
// Update Chapter

const updateChapter = async (req, res) => {

    try {

        const updatedChapter = await Chapter.findByIdAndUpdate(

            req.params.id,

            pickAllowedFields(req.body),

            {

                new: true,

                runValidators: true

            }

        );

        if (!updatedChapter) {

            return res.status(404).json({

                success: false,

                message: "Chapter Not Found"

            });

        }

        res.status(200).json({

            success: true,

            message: "Chapter Updated Successfully",

            chapter: updatedChapter

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
// Delete Chapter

const deleteChapter = async (req, res) => {

    try {

        const deletedChapter = await Chapter.findByIdAndDelete(

            req.params.id

        );

        if (!deletedChapter) {

            return res.status(404).json({

                success: false,

                message: "Chapter Not Found"

            });

        }

        res.status(200).json({

            success: true,

            message: "Chapter Deleted Successfully"

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

// Get Chapters By Subject

const getChaptersBySubject = async (req, res) => {

    try {

        const chapters = await Chapter.find({

            subjectId: req.params.subjectId

        }).sort({

            chapterNumber: 1

        });

        res.status(200).json({

            success: true,

            count: chapters.length,

            chapters

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
module.exports = {

    createChapter,

    getAllChapters,

    getSingleChapter,

    updateChapter,

    deleteChapter,

    getChaptersBySubject

};