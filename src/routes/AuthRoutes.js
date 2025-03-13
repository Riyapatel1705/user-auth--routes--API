import express from 'express';
import { login } from '../controllers/AuthController.js';
const AuthRouter = express.Router();


//user login route
AuthRouter.post('/api/login', login);



export { AuthRouter };
