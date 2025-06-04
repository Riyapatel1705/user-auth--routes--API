import env from "dotenv";
import multer from "multer";
import path from "path";
import { Op } from 'sequelize';
import { Admin } from "../db/models/Admin.js";
import { Bookmark } from "../db/models/Bookmark.js";
import { Event } from "../db/models/Event.js";
import { Feedback } from "../db/models/Feedback.js";
import { Organization } from "../db/models/Organization.js";
import { User } from "../db/models/User.js";
import { eventActionsQueue } from "../queues/bookmarkQueue.js";
import { checkEventExists, escapeLike, isValidDate } from "../utils/validation.js";
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
    return res.status(400).json({
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
      // No events found, return empty array without pagination
      return res.status(200).json({
        message: "No events found for the given filters.",
        filtersUsed: filters,
        data: [],
        pagination:null
      });
    }

    // Return events along with pagination if events are found
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
    res.status(500).json({ message: "Internal server error" });
  }
};

//get event ID wise
export const getEventById=async(req,res)=>{
  const {id}=req.query;
  if(!id){
    return res.status(400).json({message:"Please Provide an event Id"});
  }
  try {
    const event=await Event.findOne({where:{id}});
    if(!event){
      return res.status(200).json({message:"NO such event exists"});
    }
    return res.status(200).json({event});
  }catch(err){
    console.error("Error in fetching events details:",err.message);
    return res.status(500).json({message:"Internal server error"});
  }
}

//getUpcoming events 
export const getUpcomingEvents=async(req,res)=>{
  try{
    const page=Math.max(parseInt(req.query.page)||1,1);
    const limit=Math.min(Math.max(parseInt(req.query.limit)||8,1),100);
    const offset=(page-1)*limit;

    const today=new Date();
    today.setHours(0,0,0,0);

    const{count,rows}=await Event.findAndCountAll({
      where:{
        start_Date:{
          [Op.gte]:today,
        },
      },
      offset,
      limit,
      order:[["start_date","ASC"]],
    });

    if (!rows.length) {
      return res.status(200).json({
        message: "No upcoming events found.",
        filtersUsed: req.query, // Optional: Include filters used for better debugging
        data: [], // Return empty data array
      });
    }

    res.status(200).json({
      data:rows,
      pagination:{
        total:count,
        currentPage:page,
        limit,
        totalPages:Math.ceil(count/limit),
      },
    });
  }catch(err){
    console.log("Error in fetching Upcoming events:",err.message);
    res.status(500).json({message:"Internal server error!"});
  }
}


//Bookmark an event [added queue here]
export const bookmarkEvent = async (req, res) => {
  try {
    const user_id = req.user?.id;
    const { event_id } = req.body;

    if (!user_id) {
      return res.status(401).json({ message: "Unauthorized or missing user" });
    }

    if (!event_id || typeof event_id !== "string") {
      return res.status(400).json({ message: "Valid Event ID is required" });
    }

    if (!req.user.email) {
      return res.status(400).json({ message: "User email not found" });
    }

    const eventExists = await Event.findByPk(event_id);
    if (!eventExists) {
      return res.status(200).json({ message: "Event does not exist" });
    }

    const existing = await Bookmark.findOne({ where: { user_id, event_id } });
    if (existing) {
      return res.status(200).json({ message: "Already bookmarked" });
    }

    const userData = {
      userId: user_id,
      userEmail: req.user.email,
      userName: req.user.name || "User",
      eventId: event_id,
    };

    console.log("Enqueuing with userData:", userData);

    await eventActionsQueue.add('event-action-queue', userData);

    res.status(201).json({ message: "Bookmarked successfully" });
  } catch (error) {
    console.error("Bookmark error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};



//delete bookmark event of any user 
export const deleteBookmarkByUser = async (req, res) => {
  try {
    const { user_id } = req.query;

    // Check if the userId is provided
    if (!user_id) {
      return res.status(400).json({ message: "Please provide the userId" });
    }

    // Check if there are any bookmarks for the given userId
    const bookmarks = await Bookmark.findAll({
      where: { user_id: user_id }, // Find bookmarks associated with the user
    });

    if (!bookmarks || bookmarks.length === 0) {
      return res.status(200).json({ message: "No such user has marked any events" });
    }

    // Destroy all bookmarks for the user
    await Bookmark.destroy({
      where: { user_id: user_id }, // Delete all bookmarks for the given userId
    });

    return res.status(200).json({ message: "Bookmarks deleted successfully" });
  } catch (err) {
    console.log("Error in destroying user's bookmarked events:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};


//delete any event which has been bookmarked by a particular user
export const deleteBookmarkEvent = async (req, res) => {
  try {
    const { event_id, user_id } = req.query;

    if (!event_id || !user_id) {
      return res.status(400).json({ message: "Please provide both eventId and userId" });
    }

    const bookmark = await Bookmark.findOne({
      where: { event_id, user_id },
    });

    if (!bookmark) {
      return res.status(200).json({ message: "No such user has bookmarked such event" });
    }

    
    await bookmark.destroy();

    return res.status(200).json({ message: "Bookmarked event removed !" });
  } catch (err) {
    console.log("Error in removing bookmarked event:", err.message);
    return res.status(500).json({ message: "Internal server error!" });
  }
};


//get bookmarked event based on userId
export const getBookmarkedEvents = async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ message: "Please provide userId" });
    }

    const bookmarks = await Bookmark.findAll({
      where: { user_id},
      include: [
        {
          model: Event,
          required: true,
          as:"event" // Only return if event exists
        },
      ],
    });

    if (bookmarks.length === 0) {
      return res.status(200).json({ message: "No bookmarked events found for this user." });
    }

    // Extract events from bookmarks
    const bookmarkedEvents = bookmarks.map((bookmark) => bookmark.event);

    return res.status(200).json({ bookmarkedEvents });
  } catch (err) {
    console.log("Error in getting bookmarked events:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};


//cleanup the past event if the date has been gone 
export const deletePastEvents = async (req, res) => {
  try {
    const { id } = req.query;

    // Check if the user is an admin
    const admin = await Admin.findOne({ where: { id } });
    if (!admin) {
      return res.status(400).json({ message: "You are not authorized to delete events" });
    }

    // Get today's date
    const today = new Date();

    // Find past events (where the start date is less than or equal to today's date)
    const pastEvents = await Event.findAndCountAll({
      where: {
        start_Date: {
          [Op.lte]: today
        }
      }
    });

    // If there are no past events
    if (pastEvents.count === 0) {
      return res.status(400).json({ message: "No past events found" });
    }

    // Delete past events
    const deletedEvents = await Event.destroy({
      where: {
        start_Date: {
          [Op.lte]: today
        }
      }
    });

    // If there was an error in deleting
    if (deletedEvents === 0) {
      return res.status(400).json({ message: "Error in deleting events" });
    }

    return res.status(200).json({ message: "Past events have been deleted" });

  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};


//inform user about closingsoon events 
export const getEventsClosingSoon=async(req,res)=>{
  try{
  const now=new Date();
  const inThreeDays=new Date();
  inThreeDays.setDate(now.getDate()+3);

  const events=await Event.findAll({
    where:{
      start_date:{
        [Op.between]:[now,inThreeDays],
    },
  },
  order:[["start_date","ASC"]],
});
if(events.length===0){
  return res.status(200).json({message:"No upcoming events closing soon"});
}
return res.status(200).json({closingSoonEvents:events});
}catch(err){
  console.error("Error fetchung closing soon events:",err.message);
  return res.status(500).json({message:"Internal server error"});
}
};

//suggest events based on user's bookmarks
export const getSuggestedEvents=async(req,res)=>{
  try {
    const {user_id}=req.query;
    if(!user_id) return res.status(400).json({message:"User ID required"});

    const bookmarks=await Bookmark.findAll({
      where:{user_id},
      include:[{model:Event,as:"event"}]
    });
    if(!bookmarks.length)return res.status(200).json({message:"No bookmarks found"});

    const categories=bookmarks.map(b=>b.event.category);
    const bookmarkedEventIds=bookmarks.map(b=>b.event_id);

    const suggestedEvents=await Event.findAll({
      where:{
        category:categories,
        id:{[Op.notIn]:bookmarkedEventIds},
        start_date:{[Op.gte]:new Date()}
      },
      order:[['start_date','ASC']]
    });
    return res.status(200).json({suggestedEvents});
  }catch(err){
    console.log("Error in suggesting events",err.message);
    return res.status(500).json({message:"Internal server error"})
  }
};

//user feedback functions

//add feedback on any event by any user
export const addFeedback = async (req, res) => {
  const { user_id, event_id, rating, comment } = req.body;
  const now=new Date();

  const requiredFields = ["user_id", "event_id", "rating"];
  const missingFields = requiredFields.filter(
    (field) =>
      req.body[field] === undefined ||
      req.body[field] === null ||
      req.body[field] === ""
  );

  if (missingFields.length > 0) {
    return res.status(400).send({
      message: `Please fill all the required fields: ${missingFields.join(", ")}`,
    });
  }

  try {
    const event=await Event.findOne({
      where:{
        id:event_id,
        start_date:{
          [Op.lt]:now,
        },
      },
    });
    if (!event) {
      return res.status(200).json({ message: "No event found or hasn't started yet" });
    }

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const feedback = await Feedback.create({ 
      user_id,
      event_id,
      rating,
      comment,
    });

    res.status(200).json({
      message: "Feedback submitted successfully",
      feedback,
    });
  } catch (err) {
    console.log("error in submitting feedback:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//functionality of getFeedbacks of any user
export const getFeedbackOfUser=async(req,res)=>{
  const {user_id}=req.query;
  if(!user_id){
    return res.status(400).json({message:"userId is not provided "});
  }
  try {
    const user=await Feedback.findAll({where:{user_id}});
    if(user.length===0){
      return res.status(200).json({message:"This user has not added any feedbacks"});
    }
    return res.status(200).json({user});
  }catch(err){
    console.log("error in fetching feedbacks:",err.message);
    return res.status(500).json({message:"Internal server error"});
  }
}

//functionality of get feedbacks on any single event
export const getFeedbackOfEvent = async (req, res) => {
  const { event_id } = req.query;

  if (!event_id) {
    return res.status(400).json({ message: "No eventId provided" });
  }

  try {
    const eventFeedbacks = await Feedback.findAll({
      where: { event_id },
      include: [
        {
          model: User,
          attributes: ["first_name", "last_name"], // Only fetch name fields
        },
      ],
    });

    if (eventFeedbacks.length === 0) {
      return res.status(200).json({ message: "This event does not have any feedback" });
    }

    return res.status(200).json({ feedbacks: eventFeedbacks });
  } catch (err) {
    console.log("Error in fetching event's feedbacks:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};


//delete feedback of any user of any event
export const deleteFeedback=async(req,res)=>{
  const{user_id,event_id}=req.query;
  if(!user_id||!event_id){
    return res.status(400).json({message:"userId and eventId both are required fields"});
  }
  try {
    const feedback=await Feedback.findOne({where:{user_id,event_id}});
    if(!feedback){
      return res.status(200).json({message:"user has not added any feedback on this event"});
    }
    await feedback.destroy();
    return res.status(200).json({message:"Feedback has been removed successfully"});
  }catch(err){
    console.log("error in deleting Feedback:",err.message);
    return res.status(500).json({message:"Internal server error"});
  }
}

//add event based by an organization
export const addEventByOrganization = async (req, res) => {
  const { organization_id } = req.query;
  if (!organization_id) {
    return res.status(400).json({ message: "No organization_id provided" });
  }

  const requiredFields = [
    "name",
    "category",
    "start_date",
    "end_date",
    "is_virtual",
    "address",
    "price",
    "contact_details"
  ];

  try {
    const data = req.body;
    const organization = await Organization.findOne({ where: { organization_id } });

    if (!organization) {
      return res.status(404).json({ message: "No such Organization Exists!" });
    }

    const missingFields = requiredFields.filter(
      (field) =>
        data[field] === undefined ||
        data[field] === null ||
        data[field] === ""
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Please fill all the required fields: ${missingFields.join(", ")}`,
      });
    }

    const createEvent = await Event.create({
      name: data.name,
      category: data.category,
      short_description: data.short_description || null,
      start_date: data.start_date,
      end_date: data.end_date,
      is_virtual: data.is_virtual,
      address: data.address,
      city: data.city,
      state: data.state,
      postal_code: data.postal_code,
      contact_details: data.contact_details,
      organization_name: organization.organization_name,
      price: data.price
    });

    return res.status(200).json({ message: "Event created successfully", createEvent });

  } catch (err) {
    console.error("Error in creating event:", err);
    return res.status(500).json({ message: "Internal server error!!" });
  }
};


