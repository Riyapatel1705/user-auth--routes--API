import { DataTypes } from "sequelize";
import { db } from '../db.js';
import { Admin } from "./Admin.js";

export const Organization = db.define('Organization', {
    organization_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    admin_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Admin,
        key: "Admin_id"
      }
    },
    organization_name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    organization_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contact_email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: {
          msg: "Please provide a valid email address."
        }
      }
    },
    website: {
      type: DataTypes.STRING
    },
  }, {
    timestamps: true,
  });
  