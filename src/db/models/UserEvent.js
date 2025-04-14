import { db } from "../index.js";
import { DataTypes, Sequelize } from "sequelize";
import { User } from "./User.js";
import { Event } from "./Event.js";

export const UserEvent = db.define(
  "user_events",
  {
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: "users", // table name
        key: "id",
      },
      primaryKey: true,
    },
    eventId: {
      type: DataTypes.TEXT,
      references: {
        model: "events", // table name
        key: "id",
      },
      primaryKey: true,
    },
    role: {
      type: DataTypes.STRING, // Optional: e.g., attendee, speaker, organizer
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.now,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: false, // adds createdAt, updatedAt
  },
);

User.belongsToMany(Event, {
  through: UserEvent,
  foreignKey: "userId",
});
Event.belongsToMany(User, {
  through: UserEvent,
  foreignKey: "eventId",
});
