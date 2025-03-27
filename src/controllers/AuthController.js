import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../db/models/User.js';
import { checkEmailExists, checkUsernameExists, validateEmail, validatePassword, validateUsername } from '../utils/Validation.js';

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
