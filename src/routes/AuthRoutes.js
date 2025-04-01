import express from 'express';
import { register } from '../Controllers/AuthController.js';
import { login } from '../Controllers/AuthController.js';

const AuthRouter = express.Router();

AuthRouter.post('/api/register', register);
AuthRouter.post('/api/login', login);

console.log("AuthRoutes.js loaded successfully.");

export { AuthRouter };