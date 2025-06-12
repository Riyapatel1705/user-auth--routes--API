import { User } from "../db/models/User.js";
import { Event } from "../db/models/Event.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

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


