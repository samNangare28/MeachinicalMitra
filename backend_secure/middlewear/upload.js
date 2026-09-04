const multer = require("multer");

const storage = multer.memoryStorage();

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_IMAGE_EXT = /\.(jpe?g|png|webp)$/i;
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime", "video/x-matroska"];
const ALLOWED_PDF_EXT = /\.pdf$/i;

// Lecture content: one video (required) + one optional PDF.
// Checks both MIME type AND file extension - relying on either alone is
// trivially spoofed; checking both raises the bar without needing a full
// magic-byte sniff for this use case.
const lectureUpload = multer({
    storage,
    limits: {
        fileSize: 500 * 1024 * 1024, // 500MB - lecture videos are large
        files: 2
    },
    fileFilter: (req, file, cb) => {
        if (file.fieldname === "video") {
            if (ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
                return cb(null, true);
            }
            return cb(new Error("Video must be MP4, WebM, MOV or MKV"), false);
        }

        if (file.fieldname === "pdf") {
            if (file.mimetype === "application/pdf" && ALLOWED_PDF_EXT.test(file.originalname)) {
                return cb(null, true);
            }
            return cb(new Error("Notes must be a PDF file"), false);
        }

        return cb(new Error("Unexpected file field"), false);
    }
});

// Images only (subject thumbnails, profile pictures) - deliberately small
// size cap and a strict allow-list, since these are the fields that used
// to accept an arbitrary URL string from the client.
const imageUpload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 1
    },
    fileFilter: (req, file, cb) => {
        if (
            ALLOWED_IMAGE_TYPES.includes(file.mimetype) &&
            ALLOWED_IMAGE_EXT.test(file.originalname)
        ) {
            return cb(null, true);
        }
        return cb(new Error("Image must be a JPG, PNG or WEBP file under 5MB"), false);
    }
});

module.exports = { lectureUpload, imageUpload };
