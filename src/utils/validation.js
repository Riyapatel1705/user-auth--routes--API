
import { User } from '../db/models/User.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Email Validation
export const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
};

// Password Validation
export const validatePassword = (password) => {
    const regex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-zA-Z]).{6,}$/;
    return regex.test(password);
};

// Username Validation
export const validateUsername = (first_name, last_name) => {
    const regex1 = /^[a-zA-Z]{3,}$/;
    const regex2 = /^[a-zA-Z]{4,}$/;
    return regex1.test(first_name) && regex2.test(last_name);
};

// Check if Email Exists
export const checkEmailExists = async (email) => {
    try {
        const user = await User.findOne({ where: { email } });
        return user !== null;
    } catch (err) {
        throw new Error("Error checking email: " + err.message);
    }
};

//check if the user with same name exists or not

export const checkUsernameExists = async (first_name, last_name) => {
  try {
    const user = await User.findOne({ where: { first_name, last_name } });
    return user != null;
  } catch (err) {
    throw new Error("Error checking username:", err.message);
  }
};

// Send OTP Email with Error Handling
export const sendOTPEmail = async (options) => {
    try {
        if (!options.to) {
            throw new Error("Recipient email (options.to) is undefined or empty.");
        }

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const mailOptions = {
            from: process.env.FROM_EMAIL,
            to: options.to,
            subject: options.subject || "No Subject",
            text: options.text || "",
            html: options.html || "",
        };

        // Optional log
        console.log("Sending email to:", options.to);

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info.messageId);

    } catch (error) {
        console.error("Email Sending Error:", error.message);
        throw error;
    }
};