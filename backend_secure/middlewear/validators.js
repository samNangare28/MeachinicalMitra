const { body, param, validationResult } = require("express-validator");

// Run at the end of every validator chain. Turns express-validator's
// findings into a consistent 400 response instead of letting bad input
// reach a controller/DB query.
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: errors.array()[0].msg,
            errors: errors.array().map((e) => ({ field: e.path, message: e.msg }))
        });
    }
    next();
};

// Reusable field rules
const emailRule = body("email")
    .trim()
    .isEmail().withMessage("A valid email address is required")
    .isLength({ max: 254 }).withMessage("Email is too long")
    .normalizeEmail();

const passwordRule = body("password")
    .isString().withMessage("Password is required")
    .isLength({ min: 8, max: 128 }).withMessage("Password must be 8-128 characters long")
    .matches(/[a-z]/).withMessage("Password must contain a lowercase letter")
    .matches(/[A-Z]/).withMessage("Password must contain an uppercase letter")
    .matches(/[0-9]/).withMessage("Password must contain a number");

const namePattern = /^[a-zA-Z\s.'-]{2,60}$/;
const nameRule = body("name")
    .trim()
    .matches(namePattern).withMessage("Name must be 2-60 letters");

const phoneRule = body("phone")
    .trim()
    .matches(/^[0-9]{10}$/).withMessage("Phone number must be exactly 10 digits");

const mongoIdParam = (field = "id") =>
    param(field).isMongoId().withMessage(`Invalid ${field}`);

const registerValidators = [nameRule, emailRule, phoneRule, passwordRule, handleValidation];

const loginValidators = [
    emailRule,
    body("password").isString().notEmpty().withMessage("Password is required"),
    body("deviceId").isString().isLength({ min: 8, max: 200 }).withMessage("Missing device identifier"),
    handleValidation
];

const verifyDeviceValidators = [
    emailRule,
    body("otp").trim().matches(/^[0-9]{6}$/).withMessage("OTP must be a 6-digit code"),
    body("deviceId").isString().isLength({ min: 8, max: 200 }).withMessage("Missing device identifier"),
    handleValidation
];

const forgotPasswordValidators = [emailRule, handleValidation];

const resetPasswordValidators = [
    emailRule,
    body("otp").trim().matches(/^[0-9]{6}$/).withMessage("OTP must be a 6-digit code"),
    body("newPassword")
        .isLength({ min: 8, max: 128 }).withMessage("Password must be 8-128 characters long")
        .matches(/[a-z]/).withMessage("Password must contain a lowercase letter")
        .matches(/[A-Z]/).withMessage("Password must contain an uppercase letter")
        .matches(/[0-9]/).withMessage("Password must contain a number"),
    handleValidation
];

const subjectValidators = [
    body("subjectName").trim().isLength({ min: 2, max: 120 }).withMessage("Subject name must be 2-120 characters"),
    body("semester").isInt({ min: 1, max: 6 }).withMessage("Semester must be between 1 and 6"),
    body("description").trim().isLength({ min: 2, max: 2000 }).withMessage("Description must be 2-2000 characters"),
    body("price").isFloat({ min: 0, max: 1000000 }).withMessage("Price must be a valid non-negative number"),
    handleValidation
];

const chapterValidators = [
    body("chapterName").trim().isLength({ min: 2, max: 120 }).withMessage("Chapter name must be 2-120 characters"),
    body("chapterNumber").isInt({ min: 1, max: 500 }).withMessage("Chapter number must be a positive integer"),
    body("subjectId").isMongoId().withMessage("Invalid subject"),
    body("description").optional({ checkFalsy: true }).trim().isLength({ max: 2000 }).withMessage("Description too long"),
    handleValidation
];

const lectureValidators = [
    body("lectureTitle").trim().isLength({ min: 2, max: 150 }).withMessage("Lecture title must be 2-150 characters"),
    body("lectureNumber").isInt({ min: 1, max: 1000 }).withMessage("Lecture number must be a positive integer"),
    body("chapterId").isMongoId().withMessage("Invalid chapter"),
    body("description").optional({ checkFalsy: true }).trim().isLength({ max: 2000 }).withMessage("Description too long"),
    handleValidation
];

module.exports = {
    handleValidation,
    emailRule,
    passwordRule,
    nameRule,
    phoneRule,
    mongoIdParam,
    registerValidators,
    loginValidators,
    verifyDeviceValidators,
    forgotPasswordValidators,
    resetPasswordValidators,
    subjectValidators,
    chapterValidators,
    lectureValidators
};
