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
    shortDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isVirtual: {
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
    postalCode: {
      type: DataTypes.TEXT,
    },
    contactDetails: {
      type: DataTypes.JSON, // ✅ Corrected from JSONB (MySQL doesn't support JSONB)
    },
    organizationName: {
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
