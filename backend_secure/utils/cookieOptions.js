// Centralized cookie settings so auth/CSRF cookies stay consistent
// everywhere they're set or cleared.

const isProd = process.env.NODE_ENV === "production";

// httpOnly auth cookie: JS on the page can never read this, which is the
// main defense against token theft via XSS.
const authCookieOptions = () => ({
    httpOnly: true,
    secure: isProd, // requires HTTPS in production
    sameSite: isProd ? "none" : "lax", // "none" needed if frontend/backend are on different domains in prod
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days, keep in sync with JWT expiry
});

// CSRF cookie must be readable by front-end JS (that's the point of the
// double-submit pattern), so httpOnly is false here — it carries no secret
// on its own, it's only useful paired with the header the browser same-
// origin policy prevents attackers from setting.
const csrfCookieOptions = () => ({
    httpOnly: false,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000
});

module.exports = { authCookieOptions, csrfCookieOptions };
