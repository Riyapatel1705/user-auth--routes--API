import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../db/models/User.js';
import { checkEmailExists, checkUsernameExists, validateEmail, validatePassword, validateUsername,sendOTPEmail } from '../utils/Validation.js';
import crypto from 'crypto';

// Register user
export const register = async (req, res) => {
    const { first_name, last_name, email, password } = req.body;

    if (!validateUsername(first_name, last_name)) {
        return res.status(400).json({ error: 'Username must be at least 3 characters long and contain only letters and numbers.' });
    }
    if (!validatePassword(password)) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long and contain at least one number and one special character.' });
    }
    if (!validateEmail(email)) {
        return res.status(400).json({ error: 'Email format is incorrect.' });
    }

    try {
        const usernameExists = await checkUsernameExists(first_name, last_name);
        if (usernameExists) {
            return res.status(400).json({ error: 'User already exists.' });
        }

        const emailExists = await checkEmailExists(email);
        if (emailExists) {
            return res.status(400).json({ error: "This email's user already exists!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Hashed password:', hashedPassword);

        const result= await User.create({first_name,last_name,email,password:hashedPassword})
        if(result){
            res.status(200).json({message:'user created successfully!'});
        }
        else {
            res.status(401).json({message:'error in creating user'});
        }
} catch(err){
    console.error('not able to create user',err);
}
};

// Login user
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ error: 'Database error' });
    }
};
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



export const resetPassword=async(req,res)=>{
    try {
        const{email,otp,newPassword,confirmPassword}=req.body;

        if(newPassword!==confirmPassword){
            return res.status(400).json({message:"Passwords do not match "});
        }

        const user= await User.findOne({where:{email,reset_password_otp:otp}});

        if(!user){
            return res.status(400).json({ message: "Invalid OTP or email" });
        }

        //hash new password
        const hashedPassword=await bcrypt.hash(newPassword,10);

        //Update password , clear OTP and set updated_at timestamp
        await User.update(
            {
                password:hashedPassword,
                reset_password_otp:null,
                updated_at:new Date()
            },
            {where:{email}}
        );
        res.json({message:"Password reset successful"});
    }catch(error){
        res.status(500).json({message:"Internal server Error"});
    }
};

//get user details
export const getUser = async (req, res) => {
    try {
        console.log("Decoded User:", req.user); // Check the decoded user

        const userId = req.user?.id; // Ensure user ID exists

        if (!userId) {
            console.error("No user ID in decoded token");
            return res.status(401).json({ error: "Unauthorized: No user ID found" });
        }

        console.log("Fetching user with ID:", userId);

        const [rows] = await db.query(
            "SELECT id, first_name, last_name, email FROM users WHERE id = ?",
            [userId]
        );

        console.log("Database Query Result:", rows);

        if (!rows || rows.length === 0) {
            console.error("User not found in database");
            return res.status(404).json({ error: "User not found" });
        }

        const user = rows[0];

        console.log("User Found:", user);
        console.log("Sending Response:", { user });

        res.json({ user });

    } catch (err) {
        console.error("Error fetching user:", err.message);
        res.status(500).json({ error: "Server error" });
    }
};





