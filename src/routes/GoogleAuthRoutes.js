import express from "express";
import { authenticateUser, authenticateCallback, googleAuthSuccess } from "../Controllers/GoogleAuthController.js";

const GoogleAuthRouter = express.Router();

GoogleAuthRouter.get("/api/auth/google", authenticateUser);

GoogleAuthRouter.get("/auth/google/callback", authenticateCallback, (req, res) => {
    googleAuthSuccess(req, res); // Manually call googleAuthSuccess after authentication
});

export { GoogleAuthRouter };


