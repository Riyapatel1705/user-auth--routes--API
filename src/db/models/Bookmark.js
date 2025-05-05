import { DataTypes } from "sequelize";
import { Event } from "./Event.js";
import { User } from "./User.js";
import { db } from '../db.js';

export const Bookmark = db.define('Bookmark', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  event_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Event,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
}, {
  tableName: 'bookmarks'
});
