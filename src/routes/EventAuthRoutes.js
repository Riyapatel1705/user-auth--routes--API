import express from "express";
import {
  create,
  registerUserEvent,
  validateUserEvent,
  totalEvents,
  LoginTOEvents,
} from "../controller/EventAuthController.js";
import { Authorization } from "../middleware/Auth.js";
import { authorizeLoggedInEventUser } from "../middleware/EventAuth.js";
const EventAuthRouter = express.Router();

EventAuthRouter.post("/api/create", create);
EventAuthRouter.post("/api/registerUserEvent", registerUserEvent);
EventAuthRouter.post("/api/validateUserEvent", validateUserEvent);
EventAuthRouter.post("/api/logInToEvents", LoginTOEvents);
EventAuthRouter.post(
  "/api/getAllEvents",
  Authorization,
  authorizeLoggedInEventUser,
  totalEvents,
);

export { EventAuthRouter };
