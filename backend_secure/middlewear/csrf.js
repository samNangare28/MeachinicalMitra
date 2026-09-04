const crypto = require("crypto");
const { csrfCookieOptions } = require("../utils/cookieOptions");

const CSRF_COOKIE = "XSRF-TOKEN";
const CSRF_HEADER = "x-xsrf-token";
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

// Makes sure every browser session carries a CSRF token cookie. Runs on
// every request so a fresh client always gets one before it needs it.
const attachCsrfToken = (req, res, next) => {
    if (!req.cookies || !req.cookies[CSRF_COOKIE]) {
        const token = crypto.randomBytes(32).toString("hex");
        res.cookie(CSRF_COOKIE, token, csrfCookieOptions());
        req.csrfToken = token;
    } else {
        req.csrfToken = req.cookies[CSRF_COOKIE];
    }
    next();
};

// Double-submit check: the cookie can only have been set by us, and a
// cross-site attacker page cannot read it (browser same-origin policy) or
// set a custom header on a simple form-based forgery, so requiring both to
// match blocks CSRF without needing server-side session storage.
const verifyCsrfToken = (req, res, next) => {
    if (SAFE_METHODS.has(req.method)) {
        return next();
    }

    const cookieToken = req.cookies ? req.cookies[CSRF_COOKIE] : null;
    const headerToken = req.headers[CSRF_HEADER];

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
        return res.status(403).json({
            success: false,
            message: "CSRF validation failed. Please refresh the page and try again."
        });
    }

    next();
};

module.exports = { attachCsrfToken, verifyCsrfToken };
