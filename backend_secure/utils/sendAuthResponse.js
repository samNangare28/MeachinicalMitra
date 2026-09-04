const generateToken = require("./generateToken");
const { authCookieOptions } = require("./cookieOptions");

// Issues the JWT as an httpOnly cookie (never exposed to JS, so an XSS bug
// elsewhere in the app can't be used to steal the session) and returns the
// safe subset of user fields in the JSON body.
const sendAuthResponse = (res, statusCode, user, message) => {
    const token = generateToken(user._id);

    res.cookie("token", token, authCookieOptions());

    res.status(statusCode).json({
        success: true,
        message,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role
        }
    });
};

module.exports = sendAuthResponse;
