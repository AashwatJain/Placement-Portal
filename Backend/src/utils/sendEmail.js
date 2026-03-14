import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create transporter only if credentials exist, otherwise dummy.
const transporter = nodemailer.createTransport({
    service: 'gmail', // or specific host/port if needed
    auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || ''
    }
});

/**
 * Sends an email using nodemailer. If no credentials exist, simply logs the email payload.
 *
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Raw text fallback
 * @param {string} options.html - HTML body
 */
export const sendEmail = async ({ to, subject, text, html }) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log("\n[DUMMY EMAIL SERVICE] Missing EMAIL_USER / EMAIL_PASS in .env.");
        console.log(`Would have sent email to: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Text: ${text}`);
        console.log("-------------------------------------------\n");
        return { success: true, dummy: true };
    }

    try {
        const info = await transporter.sendMail({
            from: `"Placement Portal" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html,
        });
        console.log(`Email sent: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, error: error.message };
    }
};
