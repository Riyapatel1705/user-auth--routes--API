import { Sequelize, DataTypes } from "sequelize";
import { db } from '../db.js';
import { User } from './User.js';

export const Admin = db.define("admins", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  Admin_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,  // Reference to the User model
      key: "id"     // Key in the User model
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  }
});

// Explicit association in the model
Admin.belongsTo(User, { foreignKey: 'Admin_id' });
User.hasOne(Admin, { foreignKey: 'Admin_id' });
