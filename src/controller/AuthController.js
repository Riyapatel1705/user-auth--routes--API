import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../db/models/User.js";
import dotenv from "dotenv";
import Sentry from "@sentry/node";
import { CustomError } from "../utils/CustomError.js";
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
    throw new CustomError('user name must be atleast 3 letters long and can only contain characters',400,"INVALID_USERNAME_FORMAT");
  }
  if (!validatePassword(password)) {
    throw new CustomError('password must be atleast 6 letters long must include letters , characters and special characters',400,"INVALID_PASSWORD_FORMAT");
  }
  if (!validateEmail(email)) {
    throw new CustomError('email format incorrect',400,"INVALID_EMAIL_FORMAT");
  }

  try {
    const usernameExists = await checkUsernameExists(first_name, last_name);
    if (usernameExists) {
       throw new CustomError("user already exists",400,"USER_EXISTS");
    }

    const emailExists = await checkEmailExists(email);
    if (emailExists) {
        throw new CustomError("user already exists",400,"USER_EXISTS");
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
      throw new CustomError("error in creating user",400,"FAILED_TO_REGISTER");
    }
  } catch (err) {
    console.error("not able to create user", err);
    if(err instanceof CustomError){
          throw err;
        }
        Sentry.captureException(err);
        throw new CustomError("internal server error",500,"FAILED_TO_REGISTER");
    //throw new CustomError("internal server error",500,"FAILED_TO_REGISTER");
  }
};

// Login user
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
       throw new CustomError("user doesnt exist",400,"USER_DOESNT_EXISTS");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new CustomError("invalid email or password",400,"INVALID_PASSWORD");
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "24 h",
    });

    res.json({ token });
  } catch (err) {
    console.error("Error during login:", err);
    if(err instanceof CustomError){
          throw err;
        }
        Sentry.captureException(err);
        throw new CustomError("internal server error",500,"FAILED_TO_LOGIN");
    //throw new CustomError("internal server error",500,"FAILED_TO_LOGIN");
  }
};

//get user details
export const getUser = async (req, res) => {
  try {
    console.log("Decoded User:", req.user);

    const userId = req.user?.id;

    if (!userId) {
      console.error("No user ID in decoded token");
      throw new CustomError("no userid provided",400,"NO_USER_ID_PROVIDED")
    }

    console.log("Fetching user with ID:", userId);

    // Make sure User is properly imported and initialized
    const user = await User.findByPk(userId, {
      attributes: ["id", "first_name", "last_name", "email"],
    });

    if (!user) {
      console.error("User not found in database");
      throw new CustomError("user doesnt exist",400,"USER_DOESNT_EXISTS");
    }

    console.log("User Found:", user);

    res.json({ user });
  } catch (err) {
    console.error("Error fetching user:", err.message, err.stack);
    if(err instanceof CustomError){
          throw err;
        }
        Sentry.captureException(err);
        throw new CustomError("internal server error",500,"FAILED_TO_FETCH");
    //throw new CustomError("internal server error",500,"FAILED_TO_FETCH");
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
    if(err instanceof CustomError){
          throw err;
        }
        Sentry.captureException(err);
        throw new CustomError("internal server error",500,"DATABASE_ERROR");
    //throw new CustomError("internal server error",500,"DATABASE_ERROR");
  }
};

//reset password
export const resetPassword = async (req, res) => {
  try {
    const { reset_password_otp } = req.query;
    const { newPassword, confirmPassword } = req.body;

    if (!reset_password_otp) {
      throw new CustomError("otp is required",400,"OTP_IS_REQUIRED");
    }

    if (!newPassword || !confirmPassword) {
      throw new CustomError("both passwords must be same",400,"PASSWORD_MISMATCH");
    }

    const user = await User.findOne({
      where: { reset_password_otp },
    });

    if (!user) {
      throw new CustomError("user is not registered ",400,"UNAUTHORIZED_USER");
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
    if(err instanceof CustomError){
          throw err;
        }
        Sentry.captureException(err);
        throw new CustomError("internal server error",500,"DATABASE_ERROR");
    //throw new CustomError("internal server error",500,"DATABASE_ERROR");
  }
};
