export class CustomError extends Error{
    constructor(message,statusCode=500,errorCode="UNKNOWN"){
        super(message);
        this.name="CustomError";
        this.statusCode=statusCode;
        this.errorCode=errorCode;
        Error.captureStackTrace(this,this.constructor);
    }
}