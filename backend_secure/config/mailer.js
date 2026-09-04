const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST,
    port: parseInt(process.env.BREVO_SMTP_PORT, 10) || 587,
    secure: parseInt(process.env.BREVO_SMTP_PORT, 10) === 465,
    auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS
    }
});

const sendMail = async ({ to, subject, html }) => {
    try {
        await transporter.sendMail({
            from: `"${process.env.SENDER_NAME}" <${process.env.SENDER_EMAIL}>`,
            to,
            subject,
            html
        });
        return true;
    } catch (error) {
        console.log("EMAIL SEND ERROR:", error);
        return false;
    }
};

module.exports = sendMail;