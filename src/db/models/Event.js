import { DataTypes } from "sequelize";
import { db } from "../db.js";
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
    category: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    short_description: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue:null
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    is_virtual: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull:false
    },
    address: {
      type: DataTypes.TEXT,
      validate: {
        len: [5, 250],
      },
      allowNull: false,
    },
    city: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    state: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    postal_code: {
      type: DataTypes.TEXT,
    },
    phone_no: {
      type: DataTypes.STRING, // MySQL-friendly
    },
    email:{
      type:DataTypes.STRING,
    },
    organization_name: {
      type: DataTypes.TEXT,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    timestamps: false, // <--- You control timestamps manually
  }
);


Event.addHook('afterFind', (result) => {
  const attachFormattedContact = (event) => {
    const phone = event.phone_no ? `Phone: ${event.phone_no}` : null;
    const email = event.email ? `Email: ${event.email}` : null;

    event.dataValues.formatted_contact = [phone, email]
      .filter(Boolean)
      .join(' | ') || 'N/A';
  };

  if (Array.isArray(result)) {
    result.forEach(attachFormattedContact);
  } else if (result) {
    attachFormattedContact(result);
  }
});
