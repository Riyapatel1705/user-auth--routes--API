import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import path from "path";
import { fileURLToPath } from "url"; // Import fileURLToPath to use in ES modules
import { db } from "./src/db/db.js";
import { AuthRouter } from "./src/routes/AuthRoutes.js";
import { EventRouter } from "./src/routes/EventRoutes.js";
import { UserRouter } from "./src/routes/UserRoutes.js";
import { OrganizationRouter } from "./src/routes/OrganizationRoutes.js";
import { Feedback } from "./src/db/models/Feedback.js";
import './src/db/association.js';
import * as Sentry from "@sentry/node";
import '@sentry/tracing';
dotenv.config();

Sentry.init({
  dsn:process.env.SENTRY_DSN,
  tracesSampleRate:1.0,
})
const app = express();

app.use(Sentry.Handlers.requestHandler());  // Correct
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Get the directory name equivalent for ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Serve static files from 'uploads' directory
app.use("/public", express.static(path.join(__dirname, "public")));

// Routes
app.use(AuthRouter);
app.use(UserRouter);
app.use(EventRouter);
app.use(OrganizationRouter);

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

(async () => {
  try {
    await db.sync({ alter: true });
    console.log("Database synchronised");
  } catch (err) {
    console.error("Error syncing database:", err.message);
  }
})();

app.use(Sentry.Handlers.errorHandler());

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
