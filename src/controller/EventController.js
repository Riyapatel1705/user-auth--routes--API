import env from "dotenv";
import multer from "multer";
import path from "path";
import { Op, fn, col, where } from 'sequelize';
import { Event } from "../db/models/Event.js";
import { checkEventExists,isValidDate,escapeLike } from "../utils/validation.js";

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
  const data = req.body;

  const requiredFields = [
    "name", "category", "start_date", "end_date",
    "address", "contact_details", "organization_name", "price"
  ];

  const {
    name, category, short_description, start_date, end_date,
    is_virtual, address, city, state, postal_code,
    contact_details, organization_name, price
  } = data;

  const missingFields = requiredFields.filter(
    (field) => data[field] === undefined || data[field] === null || data[field] === ""
  );

  if (missingFields.length > 0) {
    return res.status(400).send({
      message: `Please fill all the required fields: ${missingFields.join(", ")}`,
    });
  }

  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized user!" });
  }

  const event = await checkEventExists(name);
  if (event) {
    return res.status(400).json({ message: "Event with this name already exists!" });
  }

  try {
    
    const image_url = req.file ? `public/uploads/${req.file.filename}` : null;

    const create = await Event.create({
      name, category, short_description, start_date, end_date,
      is_virtual, address, city, state, postal_code,
      contact_details, organization_name, price,
      image_url, created_by: userId
    });

    if (create) {
      return res.status(201).json({ message: "Event created successfully!", event: create });
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
    const event = await Event.findByPk(id,{
      attributes:['id'],
      raw:true
    });

    if (!event) {
      return res.status(404).json({ message: "No such event exists!" });
    }

    const {
      name,
      category,
      short_description,
      start_date,
      end_date,
      is_virtual,
      address,
      city,
      state,
      postal_code,
      contact_details,
      organization_name,
      price,
    } = req.body;

    await Event.update(
      {
        name,
        category,
        short_description,
        start_date,
        end_date,
        is_virtual,
        address,
        city,
        state,
        postal_code,
        contact_details,
        organization_name,
        price,
      },
      {
        where: { id:event.id },
      }
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


//list events by filter

export const getAllEvents = async (req, res) => {
  try {
    const {
      name,
      category,
      start_date,
      end_date,
      is_virtual,
      city,
      state,
      organization_name,
      min_price,
      max_price,
    } = req.query;

    // Validate date format
    if (start_date && !isValidDate(start_date)) {
      return res.status(400).json({ error: "Invalid start_date format. Use YYYY-MM-DD." });
    }
    if (end_date && !isValidDate(end_date)) {
      return res.status(400).json({ error: "Invalid end_date format. Use YYYY-MM-DD." });
    }

    // Validate price
    if ((min_price && isNaN(min_price)) || (max_price && isNaN(max_price))) {
      return res.status(400).json({ error: "Price filters must be numeric." });
    }

    // Pagination
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 8, 1), 100);
    const offset = (page - 1) * limit;

    const filters = {};

    if (name?.trim()) {
      filters.name = {
        [Op.like]: `%${escapeLike(name.trim())}%`,
      };
    }

    if (category?.trim()) {
      filters.category = {
        [Op.like]: `%${escapeLike(category.trim())}%`,
      };
    }

    if (start_date && end_date) {
      filters.start_Date = {
        [Op.between]: [new Date(start_date), new Date(end_date)],
      };
    } else if (start_date) {
      filters.start_Date = { [Op.gte]: new Date(start_date) };
    } else if (end_date) {
      filters.start_Date = { [Op.lte]: new Date(end_date) };
    }

    if (typeof is_virtual !== "undefined") {
      filters.is_Virtual = is_virtual.toLowerCase() === "true";
    }

    if (city?.trim()) {
      filters.city = {
        [Op.like]: `%${escapeLike(city.trim())}%`,
      };
    }

    if (state?.trim()) {
      filters.state = {
        [Op.like]: `%${escapeLike(state.trim())}%`,
      };
    }

    if (organization_name?.trim()) {
      filters.organization_Name = {
        [Op.like]: `%${escapeLike(organization_name.trim())}%`,
      };
    }

    if (min_price || max_price) {
      filters.price = {};
      if (!isNaN(min_price)) filters.price[Op.gte] = parseFloat(min_price);
      if (!isNaN(max_price)) filters.price[Op.lte] = parseFloat(max_price);
    }

    const { count, rows } = await Event.findAndCountAll({
      where: filters,
      offset,
      limit,
      order: [["start_Date", "ASC"]],
    });

    if (!rows.length) {
      return res.status(404).json({
        message: "No events found for the given filters.",
        filtersUsed: filters,
      });
    }

    res.status(200).json({
      data: rows,
      pagination: {
        total: count,
        currentPage: page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

