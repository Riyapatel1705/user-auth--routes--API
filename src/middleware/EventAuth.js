import { UserEvent } from "../db/models/UserEvent.js";

//chcek if any user has booked any event
export const authorizeEventAccess = async (req, res, next) => {
  const userId = req.user?.id; // from decoded JWT
  const eventId = req.params.eventId || req.query.eventId || req.body.eventId;

  if (!userId || !eventId) {
    return res
      .status(400)
      .json({ message: "User ID and Event ID are required." });
  }

  try {
    const userEvent = await UserEvent.findOne({ where: { userId, eventId } });

    if (!userEvent) {
      return res
        .status(403)
        .json({
          message: "Access denied. You are not registered for this event.",
        });
    }

    // Optional: attach event to request if needed later
    req.userEvent = userEvent;
    next();
  } catch (err) {
    console.error("Authorization error:", err);
    return res
      .status(500)
      .json({ message: "Server error during event authorization." });
  }
};

//chcek if any user is logged in event booking interface

export const authorizeLoggedInEventUser = async (req, res, next) => {
  const userId = req.user?.id; // from decoded JWT

  if (!userId) {
    return res.status(400).json({ message: "User ID is required in token." });
  }

  try {
    const userInEventSystem = await UserEvent.findOne({ where: { userId } });

    if (!userInEventSystem) {
      return res
        .status(403)
        .json({
          message: "Access denied. You are not registered in the event system.",
        });
    }

    next();
  } catch (error) {
    console.error("Login Event Authorization Error:", error);
    return res
      .status(500)
      .json({ message: "Server error during user validation." });
  }
};
