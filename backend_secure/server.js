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
// DATABASE
// =====================================================

connectDB();


// =====================================================
// TRUST PROXY
// =====================================================

app.set("trust proxy", 1);


// =====================================================
// ALLOWED FRONTEND ORIGINS
// =====================================================

const allowedOrigins = (process.env.CLIENT_URLS || "http://localhost:3000")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);


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
// CORS
// =====================================================

app.use(
    cors({
        origin: (origin, callback) => {

            // Allow requests such as Postman/server-to-server
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error("Not allowed by CORS"));
        },

        credentials: true,

        methods: [
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "OPTIONS"
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "X-XSRF-TOKEN"
        ]
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
                `Sanitized a potentially malicious key: ${key}`
            );
        }
    })
);


// =====================================================
// HTTP PARAMETER POLLUTION PROTECTION
// =====================================================

app.use(hpp());


// =====================================================
// CSRF PROTECTION
// =====================================================

// First attach/create the CSRF token cookie.
app.use(attachCsrfToken);


// -----------------------------------------------------
// CSRF TOKEN ENDPOINT
// -----------------------------------------------------
// Frontend can call this GET endpoint first.
// This makes sure the browser receives the CSRF cookie
// before making POST/PUT/DELETE requests.

app.get("/api/csrf-token", (req, res) => {
    res.json({
        success: true,
        csrfToken: req.csrfToken
    });
});


// -----------------------------------------------------
// Verify CSRF token on state-changing requests
// -----------------------------------------------------

app.use(verifyCsrfToken);


// =====================================================
// RATE LIMITING
// =====================================================

app.use(globalLimiter);


// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Mechanical Mitra API Running"
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
    console.log(`Server is running on port ${PORT}`);
});


// =====================================================
// UNHANDLED PROMISE REJECTION
// =====================================================

process.on("unhandledRejection", (err) => {
    console.error(
        "UNHANDLED REJECTION:",
        err
    );
});