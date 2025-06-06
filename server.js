import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "./src/db/db.js";
import { AuthRouter } from "./src/routes/AuthRoutes.js";
import { EventRouter } from "./src/routes/EventRoutes.js";
import { UserRouter } from "./src/routes/UserRoutes.js";
import { OrganizationRouter } from "./src/routes/OrganizationRoutes.js";
import { Feedback } from "./src/db/models/Feedback.js";
import './src/queues/bookmarkQueue.js';
import './src/db/association.js';

import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js';
import { eventActionsQueue } from "./src/queues/bookmarkQueue.js";

dotenv.config();

const app = express();
const serverAdapter= new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues:[new BullMQAdapter(eventActionsQueue)],
  serverAdapter,
});

app.use('/admin/queues',serverAdapter.getRouter());
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

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('BullMQ Dashboard at http://localhost:5000/admin/queues');
});
