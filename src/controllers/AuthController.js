import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../db/models/User.js';
import { checkEmailExists, checkUsernameExists, validateEmail, validatePassword, validateUsername } from '../utils/Validation.js';
import  logger  from './logger.js';

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

        const result = await User.create({ first_name, last_name, email, password: hashedPassword });
        
        if (result) {
            res.status(200).json({ message: 'User created successfully!' });
        } else {
            res.status(400).json({ message: 'Error in creating user' });
        }
    } catch (error) {
        logger.error({
            message: error.message,
            functionName: "register",
            requestDetails: `${req.method} ${req.originalUrl}`,
            stack: error.stack,
        });
        res.status(500).json({ success: false, error: "Internal server error" });
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
    } catch (error) {
        logger.error({
            message: error.message,
            functionName: "login",
            requestDetails: `${req.method} ${req.originalUrl}`,
            stack: error.stack,
        });
        res.status(500).json({ error: "Database error" });
    }
};
