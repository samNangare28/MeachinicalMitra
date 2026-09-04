const Subject = require("../models/subjectModel");
const uploadImage = require("../utils/cloudinaryImageUpload");

// Fields an admin is allowed to set. Never spread req.body directly into
// a create/update call — that's a mass-assignment hole that could let a
// caller overwrite fields like createdBy.
const ALLOWED_FIELDS = ["subjectName", "semester", "description", "price", "isPublished"];

const pickAllowedFields = (body) => {
    const data = {};
    for (const key of ALLOWED_FIELDS) {
        if (body[key] !== undefined) data[key] = body[key];
    }
    return data;
};

// Create Subject
const createSubject = async (req, res) => {
    try {
        const data = pickAllowedFields(req.body);
        const { subjectName, semester, description, price } = data;
        const createdBy = req.user._id;

        if (!subjectName || !semester || !description || price === undefined) {
            return res.status(400).json({
                success: false,
                message: "All required fields are mandatory"
            });
        }

        const existingSubject = await Subject.findOne({ subjectName, semester });
        if (existingSubject) {
            return res.status(400).json({
                success: false,
                message: "Subject already exists"
            });
        }

        let thumbnail = "";
        if (req.file) {
            const result = await uploadImage(req.file.buffer);
            thumbnail = result.secure_url;
        }

        const subject = await Subject.create({
            ...data,
            thumbnail,
            createdBy
        });

        res.status(201).json({
            success: true,
            message: "Subject Created Successfully",
            subject
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

// Get All Subjects
const getAllSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find();
        res.status(200).json({ success: true, count: subjects.length, subjects });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Get Single Subject
const getSingleSubject = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);
        if (!subject) {
            return res.status(404).json({ success: false, message: "Subject Not Found" });
        }
        res.status(200).json({ success: true, subject });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Update Subject
const updateSubject = async (req, res) => {
    try {
        const data = pickAllowedFields(req.body);

        if (req.file) {
            const result = await uploadImage(req.file.buffer);
            data.thumbnail = result.secure_url;
        }

        const updatedSubject = await Subject.findByIdAndUpdate(
            req.params.id,
            data,
            { new: true, runValidators: true }
        );

        if (!updatedSubject) {
            return res.status(404).json({ success: false, message: "Subject Not Found" });
        }

        res.status(200).json({
            success: true,
            message: "Subject Updated Successfully",
            subject: updatedSubject
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Delete Subject
const deleteSubject = async (req, res) => {
    try {
        const deletedSubject = await Subject.findByIdAndDelete(req.params.id);
        if (!deletedSubject) {
            return res.status(404).json({ success: false, message: "Subject Not Found" });
        }
        res.status(200).json({ success: true, message: "Subject Deleted Successfully" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

module.exports = {
    createSubject,
    getAllSubjects,
    getSingleSubject,
    updateSubject,
    deleteSubject
};
