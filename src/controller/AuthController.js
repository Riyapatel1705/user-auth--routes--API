import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../db/models/User.js";
import dotenv from "dotenv";
dotenv.config();
import {
  validateEmail,
  validateUsername,
  validatePassword,
  checkEmailExists,
  checkUsernameExists,
  sendOTPEmail
} from "../utils/validation.js";

// Register user
export const register = async (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  if (!validateUsername(first_name, last_name)) {
    return res.status(400).json({
      message:
        "Username must be at least 3 characters long and only contains letters",
    });
  }
  if (!validatePassword(password)) {
    return res.status(400).json({
      message:
        "password must be at least 6 characters long and contain at least one number and one special character",
    });
  }
  if (!validateEmail(email)) {
    return res.status(400).json({ message: "Email format is incorrect." });
  }

  try {
    const usernameExists = await checkUsernameExists(first_name, last_name);
    if (usernameExists) {
      return res.status(400).json({ message: "User already exists." });
    }

    const emailExists = await checkEmailExists(email);
    if (emailExists) {
      return res
        .status(400)
        .json({ message: "This email's user already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed password:", hashedPassword);

    const result = await User.create({
      first_name,
      last_name,
      email,
      password: hashedPassword,
    });
    if (result) {
      res.status(200).json({ message: "user created successfully!" });
    } else {
      res.status(401).json({ message: "error in creating user" });
    }
  } catch (err) {
    console.error("not able to create user", err);
  }
};

// Login user
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "24 h",
    });

    res.json({ token });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ message: "Database error" });
  }
};

//get user details
export const getUser = async (req, res) => {
  try {
    console.log("Decoded User:", req.user);

    const userId = req.user?.id;

    if (!userId) {
      console.error("No user ID in decoded token");
      return res.status(401).json({ error: "Unauthorized: No user ID found" });
    }

    console.log("Fetching user with ID:", userId);

    // Make sure User is properly imported and initialized
    const user = await User.findByPk(userId, {
      attributes: ["id", "first_name", "last_name", "email"],
    });

    if (!user) {
      console.error("User not found in database");
      return res.status(404).json({ error: "User not found" });
    }

    console.log("User Found:", user);

    res.json({ user });
  } catch (err) {
    console.error("Error fetching user:", err.message, err.stack);
    res.status(500).json({ error: "Server error" });
  }
};

//forgetPassword Logic
export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found!" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await User.update({ reset_password_otp: otp }, { where: { email } });

    // Fixed sendOTPEmail call
    await sendOTPEmail({
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP is: ${otp}`,
      html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
    });

    res.json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Forget Password Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//reset password
export const resetPassword = async (req, res) => {
  try {
    const { reset_password_otp } = req.query;
    const { newPassword, confirmPassword } = req.body;

    if (!reset_password_otp) {
      return res.status(400).json({ message: "OTP is required in query!" });
    }

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ message: "Both passwords are required" });
    }
    // STEP 1 : Validate Password
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await User.findOne({
      where: { reset_password_otp },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP!" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // STEP 3 : Update User's Password
    await User.update(
      {
        password: hashedPassword,
        reset_password_otp: null,
        updated_at: new Date(),
      },
      { where: { id: user.id } },
    );

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
