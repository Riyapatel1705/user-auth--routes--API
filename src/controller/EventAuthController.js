import { Event } from "../db/models/Event.js";
import { User } from "../db/models/User.js";
import { UserEvent } from "../db/models/UserEvent.js";
import jwt from "jsonwebtoken";
import { checkEventExists } from "../utils/validation.js";

//create event
export const create = async (req, res) => {
  const {
    name,
    shortDescription,
    startDate,
    endDate,
    isVirtual,
    address,
    postalCode,
    contactDetails,
    organizationName,
    price,
  } = req.body;

  const event = await checkEventExists(name);
  if (event) {
    return res
      .status(400)
      .json({ message: "Event with this name already exists!" });
  }

  try {
    const create = await Event.create({
      name,
      shortDescription,
      startDate,
      endDate,
      isVirtual,
      address,
      postalCode,
      contactDetails,
      organizationName,
      price,
    });

    if (create) {
      return res.status(200).json({ message: "Event created successfully!" });
    } else {
      return res.status(400).json({ message: "Error in creating an event" });
    }
  } catch (err) {
    console.error(err); // moved above return
    return res.status(500).json({ message: "Internal server error" });
  }
};

//register user in events through userId
export const registerUserEvent = async (req, res) => {
  const { userId, eventId, role } = req.body;

  if (!userId || !eventId || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const registration = await UserEvent.create({
      userId,
      eventId,
      role,
    });

    return res
      .status(200)
      .json({ message: "User registered successfully", registration });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//check if particuar user has booked any particular event
export const validateUserEvent = async (req, res) => {
  const { userId, eventId } = req.body;

  if (!userId || !eventId) {
    return res
      .status(400)
      .json({ message: "userId and eventId both are required fields!" });
  }

  try {
    const exists = await UserEvent.findOne({ where: { userId, eventId } });

    if (!exists) {
      return res
        .status(400)
        .json({ message: "No such user exists in this event!" });
    }

    const token = jwt.sign({ id: exists.userId }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.status(200).json({ token });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

//login to event (check if user actually exists in UserEvent database)

export const LoginTOEvents = async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(401).json({ message: "No userId provided in query" });
  }

  try {
    // Correct method name: findOne
    const userEvent = await UserEvent.findOne({ where: { userId } });

    if (!userEvent) {
      return res
        .status(401)
        .json({ message: "No such user has booked any event!" });
    }

    // Assuming userId is part of the userEvent model, adjust accordingly if needed
    const token = jwt.sign({ id: userEvent.userId }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//chcek total events of a particular user
export const totalEvents = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "No userId has been provided in query" });
    }

    const events = await UserEvent.findAll({
      where: { userId },
    });

    if (!events || events.length === 0) {
      return res
        .status(404)
        .json({ message: "User has not booked any event yet!" });
    }

    return res.status(200).json({ events });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
