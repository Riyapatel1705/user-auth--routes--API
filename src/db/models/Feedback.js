import { DataTypes } from "sequelize";
import {db} from '../db.js';
import {Event} from './Event.js';
import {User} from './User.js';
import { encryptComment,decrypt } from "../../utils/cryptoUtil.js";

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

//hook to encrypt comment 
Feedback.beforeCreate((feedback)=>{
    if(feedback.comment){
        feedback.comment=encryptComment(feedback.comment);
    }
});

Feedback.beforeUpdate((feedback)=>{
    if(feedback.comment){
        feedback.comment=encryptComment(feedback.comment);
    }
});

//hook to decrypt comment for each
Feedback.addHook('afterFind',(result)=>{
    const decryptField=(fb)=>{
        if(fb?.comment){
            try{
                fb.comment=decrypt(fb.comment);
            }catch(err){
                fb.comment='[Failed to decrypt]';
            }
        }
    }

    if(Array.isArray(result)){
        result.forEach(decryptField);
    }else if(result){
        decryptField(result);
    }
})