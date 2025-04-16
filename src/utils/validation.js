import { User } from "../db/models/User.js";
import { Event } from "../db/models/Event.js";

//email validation
export const validateEmail = (email) => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
};

//password validation
export const validatePassword = (password) => {
  const regex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-zAZ]).{6,}$/; // At least 6 characters, one number, one special character
  return regex.test(password);
};

//username validation
export const validateUsername = (first_name, last_name) => {
  const regex1 = /^[a-zA-Z]{3,}$/;
  const regex2 = /^[a-zA-Z]{4,}$/;
  return regex1.test(first_name) && regex2.test(last_name);
};


//check if the user with same email exists or not

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

//check if event already exists or not
export const checkEventExists = async (name) => {
  try {
    const event = await Event.findOne({ where: { name } });
    return event != null;
  } catch (err) {
    throw new Error("Error in checking event:", err.message);
  }
};
