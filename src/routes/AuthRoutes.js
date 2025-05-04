import express from "express";
import { login, register, getUser,forgetPassword,resetPassword } from "../controller/AuthController.js";
import { Authorization } from "../middleware/Auth.js";

const AuthRouter = express.Router();

AuthRouter.post("/api/register", register);
AuthRouter.post("/api/login", login);
AuthRouter.get("/api/user", Authorization, getUser);
AuthRouter.post("/api/forget-password", forgetPassword);
AuthRouter.post("/api/reset-password", resetPassword);

console.log("AuthRoutes.js loaded successfully.");

export { AuthRouter };
