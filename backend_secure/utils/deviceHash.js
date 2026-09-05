const crypto = require("crypto");

// Device IDs are already high-entropy random values generated client-side
// (not user-guessable like an OTP), so a fast SHA-256 is enough here -
// this is just to avoid storing the raw client-supplied value verbatim.
const hashDeviceId = (deviceId) =>
    crypto.createHash("sha256").update(String(deviceId)).digest("hex");

module.exports = { hashDeviceId };