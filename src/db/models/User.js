import { db } from '../index.js';
import { DataTypes, Sequelize } from 'sequelize';

export const User = db.define(
  'users',
  { id:{
    type:DataTypes.INTEGER,
    autoIncrement:true,
    primaryKey:true,
  },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique:true,
      validate: {
        isEmail: true, // checks for a valid email
        isDomainValid(value) {
          // Custom domain validation for '.com'
          if (!value.endsWith('.com')) {
            throw new Error('Email must end with .com');
          }
        }
      }
    },
    password:{
        type:DataTypes.STRING,
        allowNull:false

    },
    phone: {
      type: DataTypes.STRING, // Changed from INTEGER to STRING to accommodate various formats
      allowNull: false,
      unique:true,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Female',
      validate: {
        isIn: [['Male', 'Female']] // checks for allowed values
      }
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pin_code: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW, // Use Sequelize.NOW to get the current date/time
      allowNull: false,
    },
    created_by: {
      type: DataTypes.STRING,
      defaultValue: 'Admin',
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW, // Correct way to set the current timestamp
      allowNull: true,
    },
    updated_by: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: false,
    tableName: 'users',
  }
);
