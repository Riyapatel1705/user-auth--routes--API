import { db } from '../db/index.js';

//email validation
export const validateEmail=(email)=>{
    const regex=/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
}

//password validation
export const validatePassword=(password)=>{
   const regex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-zAZ]).{6,}$/; // At least 6 characters, one number, one special character
   return regex.test(password);
 };

 //username validation
 export const validateUsername=(first_name,Last_name)=>{
   const regex1=/^[a-zA-Z]{3,}$/;
   const regex2=/^[a-zA-Z]{4,}$/;
   return regex1.test(first_name)&&regex2.test(Last_name);
 }

 export const checkEmailExists=(email)=>{
  return new Promise((resolve,reject)=>{
      db.query('select * from users where email=?',[email],(err,rows)=>{
          if(err){
              reject("error in checking email"+err.mesage);
          }
          resolve(rows.length>0);
          
      });
  });
};

//check if user with same name exists or not
export const checkUsernameExists=(first_name,last_name)=>{
  return new Promise((resolve,reject)=>{
      db.query('select * from users where first_name=? and last_name=?',[first_name,last_name],(err,rows)=>{
          if(err){
              reject("error in checking for username",err.message);
          }
          resolve(rows.length);
      });
  });
};

 