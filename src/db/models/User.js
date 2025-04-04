import { db } from '../index.js';
import { DataTypes } from 'sequelize';

export const User = db.define(
  'users',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    updated_by: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    reset_password_otp:{
      type:DataTypes.STRING,
      unique:true,
      allowNull:true,
      validate:{
        isNumeric:true,
        len:[6,6]
      }
    }
  },
  {
    tableName: 'users',
    timestamps:false // Force Sequelize to use the exact table name
  }
);


  