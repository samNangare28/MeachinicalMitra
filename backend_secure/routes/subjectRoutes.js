const express = require("express");

const router = express.Router();

const {
    createSubject,
    getAllSubjects,
    getSingleSubject,
    updateSubject,
    deleteSubject
} = require("../controllers/subjectController");

const protect = require("../middlewear/authMiddleware");
const adminOnly = require("../middlewear/adminMiddleware");
const { imageUpload } = require("../middlewear/upload");
const { subjectValidators, mongoIdParam, handleValidation } = require("../middlewear/validators");

router.post(
    "/",
    protect,
    adminOnly,
    imageUpload.single("thumbnail"),
    subjectValidators,
    createSubject
);

router.get("/", getAllSubjects);

router.get("/:id", mongoIdParam("id"), handleValidation, getSingleSubject);

router.put(
    "/:id",
    protect,
    adminOnly,
    mongoIdParam("id"),
    imageUpload.single("thumbnail"),
    subjectValidators,
    updateSubject
);

router.delete("/:id", protect, adminOnly, mongoIdParam("id"), handleValidation, deleteSubject);

module.exports = router;
