import { db } from "../index.js";
import { DataTypes, Sequelize } from "sequelize";

export const Event = db.define(
  "events",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    short_Description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    start_Date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_Date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    is_Virtual: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    address: {
      type: DataTypes.TEXT,
      validate: {
        len: [5, 250],
      },
      allowNull: false,
    },
    image_Url: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    postal_Code: {
      type: DataTypes.TEXT,
    },
    contact_Details: {
      type: DataTypes.JSON, //  Corrected from JSONB (MySQL doesn't support JSONB)
    },
    organization_Name: {
      type: DataTypes.TEXT,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: true, // Let Sequelize handle createdAt/updatedAt
    paranoid: true, //  (Optional) enables soft deletes using deletedAt
    tableName: "events", // Optional, just for clarity
  },
);
