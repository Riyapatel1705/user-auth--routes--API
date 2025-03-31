import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import './src/config/passport.js';
import passport from 'passport';
import { AuthRouter } from './src/routes/AuthRoutes.js';
import { db } from './src/db/index.js';
import { GoogleAuthRouter } from './src/routes/GoogleAuthRoutes.js';
import logger from './src/Controllers/logger.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


//session management
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key_here',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }  // Set to true if using HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use(AuthRouter);
app.use(GoogleAuthRouter);

// Middleware for logging incoming requests
app.use((req, res, next) => {
    logger.info({
        message: `Incoming request: ${req.method} ${req.url}`,
        functionName: "RequestLogger",
        requestDetails: `${req.method} ${req.originalUrl}`
    });
    next();
});

// Connect to Database
db.sync({ alter: true })
    .then(() => {
        logger.info({ message: "Database synchronized", functionName: "DBInit" });
    })
    .catch(err => {
        logger.error({
            message: err.message,
            functionName: "DBInit",
            requestDetails: "Database connection",
            stack: err.stack
        });
    });

// Start Server
const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
    logger.info({ message: `Server is running on port ${PORT}`, functionName: "ServerInit" });
});
