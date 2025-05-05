import { DataTypes } from "sequelize";
import {db} from '../db.js';
import {Event} from './Event.js';
import {User} from './User.js';

export const Feedback=db.define(
    "feedbacks",
    {
        id:{
            type:DataTypes.UUID,
            defaultValue:DataTypes.UUIDV4,
            allowNull:false,
            primaryKey:true,
        },
        rating:{
            type:DataTypes.DECIMAL(2,1),
            allowNull:false,
            validate:{
                min:1.0,
                max:5.0
            },
        },
        comment:{
            type:DataTypes.TEXT,
            allowNull:true,
        },
        created_at:{
            type:DataTypes.DATE,
            defaultValue:DataTypes.NOW,
            allowNull:false,
        },
        updated_at:{
            type:DataTypes.DATE,
            allowNull:true,
        },

        user_id:{
            type:DataTypes.INTEGER,
            references:{
                model:User,
                key:'id',
            },
            allowNull:false,
        },
        event_id:{
            type:DataTypes.UUID,
            references:{
                model:Event,
                key:"id",
            },
            allowNull:false,
        },
    },{
        freezeTableName:true,
        timestamps:false,
    }
);