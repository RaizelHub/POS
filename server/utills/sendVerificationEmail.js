// utils/sendVerificationEmail.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const sendVerificationEmail = (email, token) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER || '2201102887@student.buksu.edu.ph',
            pass: process.env.EMAIL_PASS || 'dmkp vpck zata dfqg',
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    // Use CLIENT_URL for the frontend verification page
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL_USER || '2201102887@student.buksu.edu.ph',
        to: email,
        subject: 'Please verify your email',
        text: `Click the link to verify your email: ${verificationUrl}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending verification email:', error);
        } else {
            console.log('Verification email sent: ' + info.response);
        }
    });
};

export default sendVerificationEmail;
