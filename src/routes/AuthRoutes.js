import express from "express";
import { login, register } from "../controllers/AuthController.js";

const AuthRouter = express.Router();

AuthRouter.post("/api/register", register);
AuthRouter.post("/api/login", login);

console.log("AuthRoutes.js loaded successfully.");

export { AuthRouter };
