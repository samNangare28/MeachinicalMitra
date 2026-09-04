require("dotenv").config();

const validateEnv = require("./config/validateEnv");
validateEnv();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");

const connectDB = require("./config/db");

const {
    attachCsrfToken,
    verifyCsrfToken
} = require("./middlewear/csrf");

const { globalLimiter } = require("./middlewear/rateLimiters");

const {
    notFound,
    errorHandler
} = require("./middlewear/errorHandler");

const authRoutes = require("./routes/authRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const lectureRoutes = require("./routes/lectureRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const chapterRoutes = require("./routes/chapterRoutes");

const app = express();


// =====================================================
// TRUST PROXY
// =====================================================

app.set("trust proxy", 1);


// =====================================================
// DATABASE
// =====================================================

connectDB();


// =====================================================
// ALLOWED FRONTEND ORIGINS
// =====================================================

const allowedOrigins = (
    process.env.CLIENT_URLS ||
    "http://localhost:3000"
)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

console.log("======================================");
console.log("Allowed CORS Origins:");
console.log(allowedOrigins);
console.log("======================================");


// =====================================================
// CORS
// IMPORTANT: CORS MUST COME BEFORE OTHER MIDDLEWARE
// =====================================================

app.use(
    cors({
        origin: function (origin, callback) {

            // Allow requests without an Origin header
            // e.g. Postman / server-to-server requests
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            console.log("❌ CORS BLOCKED ORIGIN:", origin);

            return callback(
                new Error(`Not allowed by CORS: ${origin}`)
            );
        },

        credentials: true,

        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "X-XSRF-TOKEN",
            "X-CSRF-Token"
        ],

        optionsSuccessStatus: 204
    })
);


// =====================================================
// EXPLICIT PREFLIGHT HANDLING
// =====================================================

app.options("*", cors());


// =====================================================
// SECURITY HEADERS
// =====================================================

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],

                imgSrc: [
                    "'self'",
                    "data:",
                    "https://res.cloudinary.com"
                ],

                mediaSrc: [
                    "'self'",
                    "https://res.cloudinary.com"
                ],

                connectSrc: [
                    "'self'",
                    ...allowedOrigins
                ],

                scriptSrc: [
                    "'self'",
                    "https://checkout.razorpay.com"
                ],

                frameSrc: [
                    "https://api.razorpay.com",
                    "https://checkout.razorpay.com"
                ],

                styleSrc: [
                    "'self'",
                    "'unsafe-inline'"
                ],

                objectSrc: ["'none'"],

                upgradeInsecureRequests:
                    process.env.NODE_ENV === "production"
                        ? []
                        : null
            }
        },

        crossOriginResourcePolicy: {
            policy: "cross-origin"
        }
    })
);


// =====================================================
// BODY PARSERS
// =====================================================

app.use(
    express.json({
        limit: "1mb"
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "1mb"
    })
);


// =====================================================
// COOKIE PARSER
// =====================================================

app.use(cookieParser());


// =====================================================
// MONGO SANITIZATION
// =====================================================

app.use(
    mongoSanitize({
        replaceWith: "_",

        onSanitize: ({ key }) => {
            console.warn(
                `⚠️ Sanitized potentially malicious key: ${key}`
            );
        }
    })
);


// =====================================================
// HTTP PARAMETER POLLUTION PROTECTION
// =====================================================

app.use(hpp());


// =====================================================
// CSRF TOKEN
// =====================================================

// Attach / create CSRF token cookie
app.use(attachCsrfToken);


// =====================================================
// CSRF TOKEN ENDPOINT
// =====================================================

app.get("/api/csrf-token", (req, res) => {

    res.status(200).json({
        success: true,
        csrfToken: req.csrfToken
    });

});


// =====================================================
// CSRF VERIFICATION
// =====================================================

// Verify CSRF token for state-changing requests
app.use(verifyCsrfToken);


// =====================================================
// RATE LIMITING
// =====================================================

app.use(globalLimiter);


// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/", (req, res) => {

    res.status(200).json({
        success: true,
        message: "Mechanical Mitra API Running",
        environment: process.env.NODE_ENV || "development"
    });

});


// =====================================================
// API ROUTES
// =====================================================

app.use("/api/auth", authRoutes);

app.use("/api/subjects", subjectRoutes);

app.use("/api/lectures", lectureRoutes);

app.use("/api/purchases", purchaseRoutes);

app.use("/api/chapters", chapterRoutes);


// =====================================================
// 404 HANDLER
// =====================================================

app.use(notFound);


// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use(errorHandler);


// =====================================================
// SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log("======================================");
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log("======================================");

});


// =====================================================
// UNHANDLED PROMISE REJECTION
// =====================================================

process.on("unhandledRejection", (err) => {

    console.error("❌ UNHANDLED REJECTION:");
    console.error(err);

});