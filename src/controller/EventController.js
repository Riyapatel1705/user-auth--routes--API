import { Event } from "../db/models/Event.js";
import { checkEventExists } from "../utils/validation.js";
import { Sequelize } from "sequelize";
import path from "path";
import multer from "multer";
import env from 'dotenv';

env.config();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Store files in 'uploads' folder
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname)); // Add file extension
    },
  });
  
  const upload = multer({ storage: storage }).single('eventImage'); // 'eventImage' is the field name
  
  // Create event function
  export const registerUserEvent = async (req, res) => {
    const {
      name,
      short_Description,
      start_Date,
      end_Date,
      is_Virtual,
      address,
      postal_Code,
      contact_Details,
      organization_Name,
      price,
    } = req.body;
  
    const missingFields = [];
    if (!name) missingFields.push("name is a required field!");
    if (!start_Date) missingFields.push("start_Date is a required field!");
    if (!end_Date) missingFields.push("end_Date is a required field!");
    if (!address) missingFields.push("address is a required field!");
    if (!contact_Details) missingFields.push("contact_Details is a required field!");
    if (!price) missingFields.push("price is a required field!");
  
    if (missingFields.length > 0) {
      return res.status(400).json({ errors: missingFields });
    }
  
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized user!" });
    }
  
    const event = await checkEventExists(name);
    if (event) {
      return res.status(400).json({ message: "Event with this name already exists!" });
    }
  
    const image_Url = req.file ? `${process.env.NGROK_URL}/uploads/${req.file.filename}` : null;

  
    try {
      const create = await Event.create({
        name,
        short_Description,
        start_Date,
        end_Date,
        is_Virtual,
        address,
        postal_Code,
        contact_Details,
        organization_Name,
        price,
        image_Url,
        created_by: userId,
      });
  
      if (create) {
        return res.status(200).json({ message: "Event created successfully!" });
      } else {
        return res.status(400).json({ message: "Error in creating an event" });
      }
    } catch (err) {
      console.error("Event creation error:", err.errors || err.message || err);
      return res.status(500).json({ message: err.message || "Internal server error" });
    }
  };
  
  

//updateEvent function
export const updateEvent = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: "No id provided in URL" });
  }

  try {
    const event = await Event.findByPk(id);

    if (!event) {
      return res.status(404).json({ message: "No such event exists!" });
    }

    const {
        name,
        short_Description,
        start_Date,
        end_Date,
        is_Virtual,
        address,
        postal_Code,
        contact_Details,
        organization_Name,
        price,
    } = req.body;

    await Event.update(
      {
         name,
         short_Description,
         start_Date,
         end_Date,
         is_Virtual,
         address,
         postal_Code,
         contact_Details,
         organization_Name,
         price,
         updatedAt: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      {
        where: { id },
      },
    );

    return res.status(200).json({ message: "Event updated successfully!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error updating event" });
  }
};


//delete event
export const deleteEvent = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: "No id provided" });
  }

  try {
    const event = await Event.findByPk(id);

    if (!event) {
      return res.status(404).json({ message: "No such event exists!" });
    }

    await Event.destroy({
      where: { id },
    });

    return res.status(200).json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error in deleting event" });
  }
};

//get all events
export const getAllEvents = async (req, res) => {
    try {
      const events = await Event.findAll();  // add 'await' here
  
      if (!events || events.length === 0) {
        return res.status(400).json({ message: "No events have been listed" });
      }
  
      return res.status(200).json({ events });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

