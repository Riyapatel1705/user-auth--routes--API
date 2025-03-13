import express from 'express';
import { deleteUser, update } from '../controllers/UserController.js';
import { Authorization } from '../middleware/Auth.js';
export const UserRouter=express.Router();

//user update Route
UserRouter.put('/update/api/:id',Authorization,update);

//delete user Route
UserRouter.delete('/delete/api/:id',Authorization,deleteUser);


