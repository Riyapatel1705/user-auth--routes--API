import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { checkEmailExists, checkUsernameExists, validateEmail, validatePassword, validateUsername } from 'utils/validation.js';
import { db } from '../db/index.js';

// Register user
export const register = async (req, res) => {
    const { first_name, last_name, email, password, created_by } = req.body;

    console.log('Received registration data:', { first_name, last_name, email, password });

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

        const [result] = await db.query(
            'INSERT INTO users (first_name, last_name, email, password, created_by) VALUES (?, ?, ?, ?, ?)',
            [first_name, last_name, email, hashedPassword, created_by]
        );

        console.log('User registered successfully:', result);
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).json({ message: 'Failed to register user!' });
    }
};

// Login user
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        console.error('Error during login:', err); // Logs the error to the console
        res.status(500).json({ error: 'Database error' });
    }
};


