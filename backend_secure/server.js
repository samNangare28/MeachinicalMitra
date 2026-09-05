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
const { attachCsrfToken, verifyCsrfToken } = require("./middlewear/csrf");
const { globalLimiter } = require("./middlewear/rateLimiters");
const { notFound, errorHandler } = require("./middlewear/errorHandler");

// Routes
const authRoutes = require("./routes/authRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const lectureRoutes = require("./routes/lectureRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const chapterRoutes = require("./routes/chapterRoutes");

const app = express();

// Behind a reverse proxy (Render/Railway/Nginx/etc) this is required for
// secure cookies and rate-limiting to see the real client IP/protocol.
app.set("trust proxy", 1);

// Connect Database
connectDB();

const allowedOrigins = (process.env.CLIENT_URLS || "http://localhost:3000")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

// Security headers. CSP is intentionally scoped to what this app actually
// needs (Cloudinary media, Razorpay checkout) rather than left wide open.
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
                mediaSrc: ["'self'", "https://res.cloudinary.com"],
                connectSrc: ["'self'", ...allowedOrigins],
                scriptSrc: ["'self'", "https://checkout.razorpay.com"],
                frameSrc: ["https://api.razorpay.com", "https://checkout.razorpay.com"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                objectSrc: ["'none'"],
                upgradeInsecureRequests: process.env.NODE_ENV === "production" ? [] : null
            }
        },
        crossOriginResourcePolicy: { policy: "cross-origin" }
    })
);

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow same-origin/non-browser tools (no Origin header) and
            // any explicitly whitelisted frontend origin. Everything else
            // is rejected rather than reflected.
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-XSRF-TOKEN"]
    })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

// Strip any keys starting with "$" or containing "." from req.body/params/
// query — blocks NoSQL operator injection (e.g. { email: { "$ne": null } }).
app.use(
    mongoSanitize({
        replaceWith: "_",
        onSanitize: ({ key }) => {
            console.warn(`Sanitized a potentially malicious key: ${key}`);
        }
    })
);

// Prevent HTTP parameter pollution (?role=student&role=admin style attacks).
app.use(hpp());

app.use(attachCsrfToken);
app.use(verifyCsrfToken);

app.use(globalLimiter);

// Exposes the CSRF token attachCsrfToken already generated/attached above,
// for frontends that fetch it explicitly up front rather than reading the
// cookie themselves. GET is a "safe" method so verifyCsrfToken doesn't
// block it, and no auth is required — this needs to be callable before
// login/register (the very first state-changing requests a visitor makes).
app.get("/api/csrf-token", (req, res) => {
    res.json({ success: true, csrfToken: req.csrfToken });
});

// Health check
app.get("/", (req, res) => {
    res.json({ success: true, message: "Mechanical Mitra API Running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/lectures", lectureRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/chapters", chapterRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Don't let an unexpected rejected promise crash the process silently in
// production without a log trail.
process.on("unhandledRejection", (err) => {
    console.error("UNHANDLED REJECTION:", err);
});
