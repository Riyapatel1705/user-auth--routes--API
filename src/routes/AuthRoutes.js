import express from 'express';
import { login, register,getUser,forgetPassword,resetPassword } from '../controllers/AuthController.js';

const AuthRouter = express.Router();

AuthRouter.post('/api/register', register);
AuthRouter.post('/api/login', login);
AuthRouter.post('/api/forget-password',forgetPassword);
AuthRouter.post('/api/reset-password',resetPassword);
AuthRouter.get('/api/user',getUser);

console.log("AuthRoutes.js loaded successfully.");


export { AuthRouter };
