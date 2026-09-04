// Fails fast on boot if required secrets/config are missing, instead of
// limping along and producing confusing errors (or worse, insecure
// fallbacks) deep inside a request handler.

const REQUIRED_VARS = [
    "MONGO_URI",
    "JWT_SECRET",
    "CSRF_SECRET",
    "CLOUD_NAME",
    "CLOUD_API_KEY",
    "CLOUD_API_SECRET",
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET"
];

const INSECURE_DEFAULTS = [
    "change-this-to-a-long-random-string",
    "change-this-to-a-different-long-random-string",
    "secret",
    "password"
];

function validateEnv() {
    const missing = REQUIRED_VARS.filter((key) => !process.env[key] || !process.env[key].trim());

    if (missing.length > 0) {
        console.error(
            `Missing required environment variables: ${missing.join(", ")}. ` +
            "Copy .env.example to .env and fill these in before starting the server."
        );
        process.exit(1);
    }

    if (process.env.JWT_SECRET.length < 32) {
        console.error("JWT_SECRET is too short. Use at least 32 random characters (e.g. `openssl rand -hex 64`).");
        process.exit(1);
    }

    if (process.env.CSRF_SECRET.length < 32) {
        console.error("CSRF_SECRET is too short. Use at least 32 random characters.");
        process.exit(1);
    }

    if (process.env.JWT_SECRET === process.env.CSRF_SECRET) {
        console.error("JWT_SECRET and CSRF_SECRET must not be the same value.");
        process.exit(1);
    }

    if (INSECURE_DEFAULTS.includes(process.env.JWT_SECRET) || INSECURE_DEFAULTS.includes(process.env.CSRF_SECRET)) {
        console.error("JWT_SECRET / CSRF_SECRET are still set to placeholder values. Replace them with real secrets.");
        process.exit(1);
    }

    if (process.env.NODE_ENV === "production" && (!process.env.CLIENT_URLS || process.env.CLIENT_URLS.includes("localhost"))) {
        console.warn(
            "WARNING: CLIENT_URLS is unset or still points at localhost while NODE_ENV=production. " +
            "CORS/cookies will likely reject your real frontend origin."
        );
    }
}

module.exports = validateEnv;
