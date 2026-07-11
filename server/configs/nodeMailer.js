import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendEmail = async ({ to, subject, body }) => {
    try {
        return await transporter.sendMail({
            from: `"CinemaVerse 🎬" <${process.env.SENDER_EMAIL}>`,
            to,
            subject,
            html: body,
        });
    } catch (error) {
        console.error("Email sending failed:", error);
        throw error;
    }
};

export default sendEmail;