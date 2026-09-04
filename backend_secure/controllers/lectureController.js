    //  Create Lecture 
const Lecture = require("../models/lectureModel");
const uploadVideo = require("../utils/cloudinaryUpload");
const uploadPdf = require("../utils/cloudinaryPdfUpload");

// Update must never accept videoUrl/pdfUrl directly from the client body -
// those are only ever set server-side from an actual uploaded file, or a
// caller could point a lecture at an arbitrary external URL.
const ALLOWED_UPDATE_FIELDS = ["lectureTitle", "lectureNumber", "description", "duration", "isDemo", "chapterId"];
const pickAllowedFields = (body) => {
    const data = {};
    for (const key of ALLOWED_UPDATE_FIELDS) {
        if (body[key] !== undefined) data[key] = body[key];
    }
    return data;
};

const createLecture = async (req, res) => {

    try {

        const {
            lectureTitle,
            lectureNumber,
            description,
            duration,
            isDemo,
            chapterId
        } = req.body;


        // CHECK REQUIRED FIELDS

        if (
            !lectureTitle ||
            !lectureNumber ||
            !chapterId
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Lecture title, lecture number and chapter are required"

            });

        }


        // CHECK VIDEO

        if (
            !req.files ||
            !req.files.video ||
            !req.files.video[0]
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Lecture video is required"

            });

        }


        // CHECK DUPLICATE

        const existingLecture =
            await Lecture.findOne({

                chapterId,
                lectureNumber

            });


        if (existingLecture) {

            return res.status(400).json({

                success: false,

                message:
                    "Lecture already exists"

            });

        }


        // VIDEO FILE

        const videoFile =
            req.files.video[0];


        // UPLOAD VIDEO TO CLOUDINARY

        console.log(
            "Uploading video to Cloudinary..."
        );


        const videoResult =
            await uploadVideo(
                videoFile.buffer
            );


        console.log(
            "Video uploaded successfully"
        );


        // PDF URL

        let pdfUrl = "";


        // UPLOAD PDF IF PROVIDED

        if (
            req.files.pdf &&
            req.files.pdf[0]
        ) {

            const pdfFile =
                req.files.pdf[0];


            console.log(
                "Uploading PDF to Cloudinary..."
            );


            const pdfResult =
                await uploadPdf(
                    pdfFile.buffer
                );


            pdfUrl =
                pdfResult.secure_url;


            console.log(
                "PDF uploaded successfully"
            );

        }


        // VIDEO URL

        const videoUrl =
            videoResult.secure_url;


        // CREATE LECTURE

        const lecture =
            await Lecture.create({

                lectureTitle,

                lectureNumber:
                    Number(lectureNumber),

                description:
                    description || "",

                videoUrl,

                pdfUrl,

                duration:
                    duration || "",

                isDemo:
                    isDemo === true ||
                    isDemo === "true",

                chapterId

            });


        // RESPONSE

        res.status(201).json({

            success: true,

            message:
                "Lecture Created Successfully",

            lecture

        });

    }

    catch (error) {

        console.log(
            "CREATE LECTURE ERROR:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Server Error"

        });

    }

};
//  Get All Lectures 
const getAllLectures = async (req, res) => {
    try {
        const lectures = await Lecture.find()
            .populate("chapterId", "chapterName chapterNumber")
            .sort({
                lectureNumber: 1
            });
        res.status(200).json({
            success: true,
            count: lectures.length,
            lectures
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

//  Get Lectures By Chapter 
const getLecturesByChapter = async (req, res) => {
    try {
        const { chapterId } = req.params;
        const lectures = await Lecture.find({
            chapterId
        }).sort({
            lectureNumber: 1
        });
        res.status(200).json({
            success: true,
            count: lectures.length,
            lectures
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
//  Get Single Lecture 
const getSingleLecture = async (req, res) => {
    try {
        const lecture = await Lecture.findById(req.params.id)
            .populate("chapterId", "chapterName chapterNumber");
        if (!lecture) {
            return res.status(404).json({
                success: false,
                message: "Lecture Not Found"
            });
        }
        res.status(200).json({
            success: true,
            lecture
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

//  Update Lecture 
const updateLecture = async (req, res) => {
    try {
        const data = pickAllowedFields(req.body);

        // Replacing the video/PDF is optional on edit - only re-upload
        // (and only touch videoUrl/pdfUrl) when a new file was actually sent.
        if (req.files && req.files.video && req.files.video[0]) {
            const videoResult = await uploadVideo(req.files.video[0].buffer);
            data.videoUrl = videoResult.secure_url;
        }
        if (req.files && req.files.pdf && req.files.pdf[0]) {
            const pdfResult = await uploadPdf(req.files.pdf[0].buffer);
            data.pdfUrl = pdfResult.secure_url;
        }

        const updatedLecture = await Lecture.findByIdAndUpdate(
            req.params.id,
            data,
            {
                new: true,
                runValidators: true
            }
        );
        if (!updatedLecture) {
            return res.status(404).json({
                success: false,
                message: "Lecture Not Found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Lecture Updated Successfully",
            lecture: updatedLecture
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
//  Delete Lecture 
const deleteLecture = async (req, res) => {
    try {
        const deletedLecture = await Lecture.findByIdAndDelete(
            req.params.id
        );
        if (!deletedLecture) {
            return res.status(404).json({
                success: false,
                message: "Lecture Not Found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Lecture Deleted Successfully"
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

//  Exports 

module.exports = {

    createLecture,

    getAllLectures,

    getLecturesByChapter,

    getSingleLecture,

    updateLecture,

    deleteLecture

};