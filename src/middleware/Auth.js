import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

//add authorization
export const Authorization = (req, res, next) => {
    console.log('Request headers:', req.headers); // Log headers to see the incoming request
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ error: 'Invalid token.' });
    }
};