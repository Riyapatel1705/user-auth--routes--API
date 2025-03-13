import express from 'express';
import { login, register } from '../controllers/AuthController.js';
export const AuthRouter = express.Router();


//user register route
AuthRouter.post('/register/api', register);


//user login route
AuthRouter.post('/login/api', login);


