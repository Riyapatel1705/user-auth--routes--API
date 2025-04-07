import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import passport from "./src/config/passport.js"; // path to your passport.js
import { AuthRouter } from "./src/routes/AuthRoutes.js";
import { UserRouter } from "./src/routes/UserRoutes.js";
import { GoogleAuthRouter } from "./src/routes/GoogleAuthRoutes.js";
import { db } from "./src/db/index.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Session setup (important for passport to work properly)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "mySecretKey",
    resave: false,
    saveUninitialized: false,
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use(AuthRouter);
app.use(UserRouter);
app.use(GoogleAuthRouter);

// Request Logger
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Database Sync
(async () => {
  try {
    await db.sync({ alter: true });
    console.log("Database synchronised");
  } catch (err) {
    console.error("Error syncing database:", err);
  }
})();

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
