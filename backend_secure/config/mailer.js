// Render's free tier blocks outbound SMTP ports (25, 465, 587) entirely,
// so nodemailer-over-SMTP can never connect from here no matter how
// correct the credentials are. Brevo's transactional email HTTP API sends
// over plain HTTPS instead, which isn't blocked - same email delivery,
// different transport. Requires BREVO_API_KEY (from Brevo dashboard ->
// SMTP & API -> API Keys), not the SMTP username/password used before.
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

const sendMail = async ({ to, subject, html }) => {
    try {
        const response = await fetch(BREVO_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "api-key": process.env.BREVO_API_KEY
            },
            body: JSON.stringify({
                sender: {
                    name: process.env.SENDER_NAME,
                    email: process.env.SENDER_EMAIL
                },
                to: [{ email: to }],
                subject,
                htmlContent: html
            })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.log("EMAIL SEND ERROR:", response.status, errorBody);
            return false;
        }

        return true;
    } catch (error) {
        console.log("EMAIL SEND ERROR:", error);
        return false;
    }
};

module.exports = sendMail;