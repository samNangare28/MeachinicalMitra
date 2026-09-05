const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const sendMail = require("../config/mailer");
const sendAuthResponse = require("../utils/sendAuthResponse");
const { authCookieOptions } = require("../utils/cookieOptions");
const { hashDeviceId } = require("../utils/deviceHash");

const DEVICE_TRUST_DAYS = 30;

// Generic message used for both "email exists" and "email doesn't exist"
// cases on forgot-password, so the endpoint can't be used to enumerate
// which emails are registered.
const GENERIC_OTP_MESSAGE = "If an account exists for that email, an OTP has been sent.";

const registerUser = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        if (!name || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const normalizedEmail = String(email).toLowerCase().trim();

        const existingUser = await User.findOne({
            $or: [{ email: normalizedEmail }, { phone: String(phone).trim() }]
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "An account with this email or phone already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        // role is intentionally never read from req.body — every account
        // is created as a student; admin promotion happens directly in the
        // database, never through a public-facing endpoint.
        const user = await User.create({
            name: String(name).trim(),
            email: normalizedEmail,
            phone: String(phone).trim(),
            password: hashedPassword
        });

        await sendAuthResponse(res, 201, user, "Registration Successful");

        // Fire-and-forget: a flaky mail provider should never fail
        // registration itself, since the response has already been sent.
        sendMail({
            to: user.email,
            subject: "Welcome to Mechanical Mitra",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
                    <h2 style="color: #f59e0b;">Welcome, ${escapeHtml(user.name)}!</h2>
                    <p>Your account on <b>Mechanical Mitra</b> has been created successfully.</p>
                    <p>You can now log in and start exploring subjects, chapters, and lectures.</p>
                    <br/>
                    <p>Happy Learning</p>
                    <p><b>Team Mechanical Mitra</b></p>
                </div>
            `
        }).catch((err) => console.log("WELCOME EMAIL ERROR:", err));
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password, deviceId } = req.body;

        // Belt-and-braces NoSQL-injection guard: if someone posts a JSON
        // body where email/password are objects (e.g. {"$ne": null})
        // instead of strings, reject before it ever reaches a query.
        if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (typeof deviceId !== "string" || deviceId.trim().length < 8) {
            return res.status(400).json({
                success: false,
                message: "Missing device identifier. Please refresh the page and try again."
            });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() })
            .select("+activeSessionId +trustedDevices");
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid Email or Password"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid Email or Password"
            });
        }

        if (user.isActive === false) {
            return res.status(403).json({
                success: false,
                message: "This account has been disabled. Contact support."
            });
        }

        // Drop any expired entries so the list can't grow forever, and
        // check whether this specific browser has already been verified.
        const now = Date.now();
        user.trustedDevices = (user.trustedDevices || []).filter((d) => d.expiresAt > now);

        const deviceHash = hashDeviceId(deviceId);
        const isTrustedDevice = user.trustedDevices.some((d) => d.deviceHash === deviceHash);

        if (!isTrustedDevice) {
            // Unrecognized device: pause the login and require an emailed
            // OTP before this device is trusted and the session is issued.
            const otp = crypto.randomInt(100000, 999999).toString();
            user.pendingDeviceOtp = await bcrypt.hash(otp, 10);
            user.pendingDeviceOtpExpiry = Date.now() + 10 * 60 * 1000; // 10 min
            user.pendingDeviceHash = deviceHash;
            await user.save();

            sendMail({
                to: user.email,
                subject: "Verify this device - Mechanical Mitra",
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
                        <h2 style="color: #f59e0b;">New Device Login</h2>
                        <p>Someone is trying to log in to your Mechanical Mitra account from a device we don't recognize.</p>
                        <p>If this is you, enter this code to continue. It's valid for 10 minutes:</p>
                        <h1 style="letter-spacing: 6px; color: #1f2937;">${otp}</h1>
                        <p>If this wasn't you, do not share this code with anyone and consider changing your password.</p>
                    </div>
                `
            }).catch((err) => console.log("DEVICE OTP EMAIL ERROR:", err));

            return res.status(200).json({
                success: true,
                requiresDeviceVerification: true,
                message: "We sent a verification code to your email to confirm this new device."
            });
        }

        // Known device: let the newly logged-in device know it just signed
        // another device out, since that device won't find out until its
        // next request fails.
        const otherDeviceLoggedOut = Boolean(user.activeSessionId);

        await sendAuthResponse(res, 200, user, "Login Successful", { otherDeviceLoggedOut });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// STEP 2 of a new-device login: verify the emailed OTP, mark this device
// as trusted for future logins, then complete the login exactly like a
// normal loginUser success would (including kicking any other active
// session, since single-device enforcement applies regardless of whether
// the device itself is newly trusted or already known).
const verifyDeviceLogin = async (req, res) => {
    try {
        const { email, otp, deviceId } = req.body;

        if (
            typeof email !== "string" || typeof otp !== "string" || typeof deviceId !== "string" ||
            !email || !otp || !deviceId
        ) {
            return res.status(400).json({
                success: false,
                message: "Email, OTP and device identifier are required"
            });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() })
            .select("+activeSessionId +trustedDevices +pendingDeviceOtp +pendingDeviceOtpExpiry +pendingDeviceHash");

        const deviceHash = hashDeviceId(deviceId);

        if (
            !user ||
            !user.pendingDeviceOtp ||
            !user.pendingDeviceOtpExpiry ||
            user.pendingDeviceOtpExpiry < Date.now() ||
            user.pendingDeviceHash !== deviceHash
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired code. Please try logging in again."
            });
        }

        const otpMatches = await bcrypt.compare(otp, user.pendingDeviceOtp);
        if (!otpMatches) {
            return res.status(400).json({
                success: false,
                message: "Incorrect code. Please try again."
            });
        }

        const now = Date.now();
        user.trustedDevices = (user.trustedDevices || []).filter((d) => d.expiresAt > now);
        user.trustedDevices.push({
            deviceHash,
            expiresAt: now + DEVICE_TRUST_DAYS * 24 * 60 * 60 * 1000
        });

        user.pendingDeviceOtp = null;
        user.pendingDeviceOtpExpiry = null;
        user.pendingDeviceHash = null;

        const otherDeviceLoggedOut = Boolean(user.activeSessionId);

        await sendAuthResponse(res, 200, user, "Device verified. Login Successful", { otherDeviceLoggedOut });
    }
    catch (error) {
        console.log("VERIFY DEVICE ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

const logoutUser = async (req, res) => {
    try {
        // req.user is available here since this route runs behind `protect`.
        // Clearing this server-side (not just deleting the cookie) means a
        // copied/cached cookie can't be replayed after the user logs out.
        req.user.activeSessionId = null;
        await req.user.save();
    } catch (error) {
        console.log("LOGOUT ERROR:", error);
    }

    res.clearCookie("token", { ...authCookieOptions(), maxAge: undefined });
    res.status(200).json({ success: true, message: "Logged out" });
};

const getMe = async (req, res) => {
    // req.user is already populated (minus password) by the protect middleware
    res.status(200).json({
        success: true,
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            phone: req.user.phone,
            role: req.user.role
        }
    });
};

// STEP 1: Request OTP
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (typeof email !== "string" || !email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });

        // Always behave the same way whether or not the account exists,
        // and always return the same generic message.
        if (user) {
            const otp = crypto.randomInt(100000, 999999).toString();
            // Store a hash of the OTP, not the OTP itself — a DB read
            // (backup leak, injection, etc.) shouldn't hand out live codes.
            user.resetOtp = await bcrypt.hash(otp, 10);
            user.resetOtpExpiry = Date.now() + 10 * 60 * 1000; // valid 10 min
            await user.save();

            sendMail({
                to: user.email,
                subject: "Password Reset OTP - Mechanical Mitra",
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
                        <h2 style="color: #f59e0b;">Password Reset Request</h2>
                        <p>Use the OTP below to reset your password. This code is valid for 10 minutes.</p>
                        <h1 style="letter-spacing: 6px; color: #1f2937;">${otp}</h1>
                        <p>If you didn't request this, you can safely ignore this email.</p>
                    </div>
                `
            }).catch((err) => console.log("OTP EMAIL ERROR:", err));
        }

        res.status(200).json({
            success: true,
            message: GENERIC_OTP_MESSAGE
        });
    } catch (error) {
        console.log("FORGOT PASSWORD ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// STEP 2: Verify OTP + Reset password
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (
            typeof email !== "string" || typeof otp !== "string" || typeof newPassword !== "string" ||
            !email || !otp || !newPassword
        ) {
            return res.status(400).json({
                success: false,
                message: "Email, OTP and new password are required"
            });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });

        if (
            !user ||
            !user.resetOtp ||
            !user.resetOtpExpiry ||
            user.resetOtpExpiry < Date.now()
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP"
            });
        }

        const otpMatches = await bcrypt.compare(otp, user.resetOtp);
        if (!otpMatches) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP"
            });
        }

        user.password = await bcrypt.hash(newPassword, 12);
        user.resetOtp = null;
        user.resetOtpExpiry = null;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password reset successfully"
        });
    } catch (error) {
        console.log("RESET PASSWORD ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// Minimal HTML escaping for values interpolated into email templates.
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

module.exports = {
    registerUser,
    loginUser,
    verifyDeviceLogin,
    logoutUser,
    getMe,
    forgotPassword,
    resetPassword
};