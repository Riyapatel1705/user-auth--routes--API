import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { AuthRouter } from "./src/routes/AuthRoutes.js";
import { UserRouter } from "./src/routes/UserRoutes.js";
import { EventRouter } from "./src/routes/EventRoutes.js";
import { db } from "./src/db/index.js";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url"; // Import fileURLToPath to use in ES modules

dotenv.config();

const app = express();
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Get the directory name equivalent for ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Serve static files from 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use(AuthRouter);
app.use(UserRouter);
app.use(EventRouter);

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

(async () => {
  try {
    await db.sync({ alter: true });
    console.log("Database synchronised");
  } catch (err) {
    console.error("Error syncing database:", err);
  }
})();

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
