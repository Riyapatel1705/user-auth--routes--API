import express from "express";
import {
  updateEvent,
  deleteEvent,
  deleteUserEvent,
} from "../controller/EventController.js";
import { Authorization } from "../middleware/Auth.js";
import { authorizeEventAccess } from "../middleware/EventAuth.js";

const EventRouter = express.Router();

EventRouter.put("/api/updateEvent", updateEvent);
EventRouter.delete("/api/deleteEvent", deleteEvent);
EventRouter.delete(
  "/api/deleteUserEvent",
  Authorization,
  authorizeEventAccess,
  deleteUserEvent,
);

export { EventRouter };
