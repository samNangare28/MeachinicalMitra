// Wrap async route handlers so thrown errors/rejected promises reach the
// centralized error handler instead of crashing the process or hanging
// the request.
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

const notFound = (req, res) => {
    res.status(404).json({
        success: false,
        message: "Route Not Found"
    });
};

// Keep this last in the middleware chain. Never leak stack traces or raw
// driver/library error messages to the client in production — they can
// reveal schema, file paths, or library versions useful to an attacker.
const errorHandler = (err, req, res, next) => {
    console.error(err);

    let statusCode = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;
    let message = "Server Error";

    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors).map((e) => e.message).join(", ");
    } else if (err.code === 11000) {
        statusCode = 400;
        message = "Duplicate value: this record already exists";
    } else if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid identifier";
    } else if (err.name === "MulterError") {
        statusCode = 400;
        message = err.message;
    } else if (statusCode !== 500) {
        message = err.message || message;
    }

    res.status(statusCode).json({
        success: false,
        message
    });
};

module.exports = { asyncHandler, notFound, errorHandler };
