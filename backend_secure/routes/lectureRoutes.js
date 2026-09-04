const express = require("express");

const router = express.Router();

const {
    createLecture,
    getAllLectures,
    getLecturesByChapter,
    getSingleLecture,
    updateLecture,
    deleteLecture
} = require("../controllers/lectureController");

const protect = require("../middlewear/authMiddleware");
const adminOnly = require("../middlewear/adminMiddleware");
const { lectureUpload } = require("../middlewear/upload");
const { lectureValidators, mongoIdParam, handleValidation } = require("../middlewear/validators");

const uploadFields = lectureUpload.fields([
    { name: "video", maxCount: 1 },
    { name: "pdf", maxCount: 1 }
]);

// Create Lecture
router.post("/", protect, adminOnly, uploadFields, lectureValidators, createLecture);

// Get All Lectures
router.get("/", getAllLectures);

// Get Lectures By Chapter
router.get("/chapter/:chapterId", mongoIdParam("chapterId"), handleValidation, getLecturesByChapter);

// Get Single Lecture
router.get("/:id", mongoIdParam("id"), handleValidation, getSingleLecture);

// Update Lecture (video/pdf replacement optional)
router.put("/:id", protect, adminOnly, mongoIdParam("id"), uploadFields, lectureValidators, updateLecture);

// Delete Lecture
router.delete("/:id", protect, adminOnly, mongoIdParam("id"), handleValidation, deleteLecture);

module.exports = router;
