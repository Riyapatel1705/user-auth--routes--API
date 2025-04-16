import express from "express";
import upload from '../middleware/upload.js';

import { Authorization } from "../middleware/Auth.js";
import { deleteEvent, getAllEvents, registerUserEvent, updateEvent } from "../controller/EventController.js";

const EventRouter = express.Router();

EventRouter.post("/api/register-event",Authorization,upload.single('file'),registerUserEvent);
EventRouter.put("/api/update-event",Authorization, updateEvent);
EventRouter.delete("/api/delete-event",Authorization, deleteEvent);
EventRouter.get("/api/getall-events",getAllEvents);

export { EventRouter };
