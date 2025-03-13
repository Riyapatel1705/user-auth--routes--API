import express from 'express';
import { login, register } from '../controllers/AuthController.js';
const AuthRouter = express.Router();


//user register route
AuthRouter.post('/api/register', register);


//user login route
AuthRouter.post('/api/login', login);



export { AuthRouter };
