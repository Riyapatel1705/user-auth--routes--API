//validations

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
 export const validateUsername=(first_name,last_name)=>{
   const regex1=/^[a-zA-Z]{3,}$/;
   const regex2=/^[a-zA-Z]{4,}$/;
   return regex1.test(first_name)&&regex2.test(last_name);
 }

