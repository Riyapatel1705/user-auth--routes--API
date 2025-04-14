import { Event } from "../db/models/Event.js";
import { UserEvent } from "../db/models/UserEvent.js";
import { Sequelize } from "sequelize";

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

    await Event.update(
      {
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

//delete any event from user's booking
export const deleteUserEvent = async (req, res) => {
  const { userId, eventId } = req.query;

  if (!userId || !eventId) {
    return res
      .status(400)
      .json({
        message: "userId and eventId are required to delete the booking.",
      });
  }

  try {
    const userEvent = await UserEvent.findOne({ where: { userId, eventId } });

    if (!userEvent) {
      return res
        .status(404)
        .json({ message: "No such booking found for this user and event." });
    }

    await userEvent.destroy();

    return res
      .status(200)
      .json({ message: "User successfully removed from the event." });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error deleting user from the event." });
  }
};
