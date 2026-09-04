const express = require("express");

const router = express.Router();

const { createChapter,
        getAllChapters,
        getSingleChapter,
        updateChapter,
        deleteChapter,
        getChaptersBySubject
        } = require("../controllers/chapterController");

const protect = require("../middlewear/authMiddleware");
const adminOnly = require("../middlewear/adminMiddleware");
const { chapterValidators, mongoIdParam, handleValidation } = require("../middlewear/validators");

router.post("/", protect, adminOnly, chapterValidators, createChapter);
router.get("/", getAllChapters);
router.get("/subject/:subjectId", mongoIdParam("subjectId"), handleValidation, getChaptersBySubject);
router.get("/:id", mongoIdParam("id"), handleValidation, getSingleChapter);
router.put("/:id", protect, adminOnly, mongoIdParam("id"), chapterValidators, updateChapter);
router.delete("/:id", protect, adminOnly, mongoIdParam("id"), handleValidation, deleteChapter);

module.exports = router;
