import { Event } from "../db/models/Event.js";
import { checkEventExists } from "../utils/validation.js";
import { Sequelize } from "sequelize";
import { Op } from "sequelize";
import path from "path";
import multer from "multer";
import env from "dotenv";

env.config();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Store files in 'uploads' folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Add file extension
  },
});

const upload = multer({ storage: storage }).single("eventImage"); // 'eventImage' is the field name

// Create event function
export const registerUserEvent = async (req, res) => {
  const {
    name,
    category,
    short_Description,
    start_Date,
    end_Date,
    is_Virtual,
    address,
    city,
    state,
    postal_Code,
    contact_Details,
    organization_Name,
    price,
  } = req.body;

  const missingFields = [];
  if (!name) missingFields.push("name is a required field!");
  if (!category) missingFields.push("category is a required field!");
  if (!start_Date) missingFields.push("start_Date is a required field!");
  if (!end_Date) missingFields.push("end_Date is a required field!");
  if (!address) missingFields.push("address is a required field!");
  if (!contact_Details)
    missingFields.push("contact_Details is a required field!");
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
    return res
      .status(400)
      .json({ message: "Event with this name already exists!" });
  }

  const image_Url = req.file
    ? `${process.env.NGROK_URL}/uploads/${req.file.filename}`
    : null;

  try {
    const create = await Event.create({
      name,
      category,
      short_Description,
      start_Date,
      end_Date,
      is_Virtual,
      address,
      city,
      state,
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
    return res
      .status(500)
      .json({ message: err.message || "Internal server error" });
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
      category,
      short_Description,
      start_Date,
      end_Date,
      is_Virtual,
      address,
      city,
      state,
      postal_Code,
      contact_Details,
      organization_Name,
      price,
    } = req.body;

    await Event.update(
      {
        name,
        category,
        short_Description,
        start_Date,
        end_Date,
        is_Virtual,
        address,
        city,
        state,
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
    const events = await Event.findAll(); // add 'await' here

    if (!events || events.length === 0) {
      return res.status(400).json({ message: "No events have been listed" });
    }

    return res.status(200).json({ events });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//list events by filter
export const getEventsByFilter = async (req, res) => {
  try {
    const {
      name,
      category,
      start_Date,
      end_Date,
      is_Virtual,
      city,
      state,
      organization_Name,
      minprice,
      maxPrice,
      page = 1,
      limit = 10,
    } = req.query;

    const filters = {};

    if (name) {
      filters.name = { [Op.like]: `%${name}%` };
    }
    if (category) {
      filters.category = { [Op.like]: `%${category}%` };
    }
    if (start_Date && end_Date) {
      filters.start_Date = {
        [Op.between]: [new Date(start_Date), new Date(end_Date)],
      };
    }
    if (is_Virtual !== undefined) {
      filters.is_Virtual = is_Virtual === "true";
    }
    if (city) {
      filters.city = { [Op.like]: `%${city}%` };
    }
    if (state) {
      filters.state = { [Op.like]: `%${state}%` };
    }
    if (organization_Name) {
      filters.organization_Name = { [Op.like]: `%${organization_Name}%` };
    }
    if (minprice || maxPrice) {
      filters.price = {};
      if (minprice) filters.price[Op.gte] = parseInt(minprice);
      if (maxPrice) filters.price[Op.lte] = parseInt(maxPrice);
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Event.findAndCountAll({
      where: filters,
      offset: offset,
      limit: parseInt(limit),
      order: [["start_Date", "ASC"]],
    });

    if (count === 0) {
      let message = "No events found";
      if (name) message += ` with name '${name}'`;
      else if (category) message += ` in category '${category}'`;
      else if (city) message += ` in city '${city}'`;
      else if (state) message += ` in state '${state}'`;
      else if (organization_Name)
        message += ` by organization '${organization_Name}'`;
      else if (start_Date && end_Date)
        message += ` between ${start_Date} and ${end_Date}`;
      else if (is_Virtual !== undefined)
        message +=
          is_Virtual === "true"
            ? " for virtual events"
            : " for in-person events";
      else if (minprice || maxPrice)
        message += ` in price range ${minprice || 0} - ${maxPrice || "∞"}`;

      return res.status(404).json({ message });
    }

    res.status(200).json({
      data: rows,
      pagination: {
        total: count,
        currentPage: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
