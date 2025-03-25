import { User } from '../models/User.js';

//email validation
export const validateEmail=(email)=>{
    const regex=/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
}

//password validation
export const validatePassword=(password)=>{
   const regex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-zAZ]).{6,}$/; // At least 6 characters, one number, one special character
   return regex.test(password);
 };

 //username validation
 export const validateUsername=(first_name,Last_name)=>{
   const regex1=/^[a-zA-Z]{3,}$/;
   const regex2=/^[a-zA-Z]{4,}$/;
   return regex1.test(first_name)&&regex2.test(Last_name);
 }

 export const checkEmailExists = async (email) => {
    try {
        const user = await User.findOne({ where: { email } });
        return user !== null;
    } catch (err) {
        throw new Error("Error checking email: " + err.message);
    }
};


//check if user with same name exists or not
export const checkUsernameExists = async (first_name, last_name) => {
    try {
        const user = await User.findOne({ where: { first_name, last_name } });
        return user !== null;
    } catch (err) {
        throw new Error("Error checking username: " + err.message);
    }
};
