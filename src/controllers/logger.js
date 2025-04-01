import winston from "winston";

//function to showcase custom error logs
const customFormat = winston.format.printf(({ level, message, timestamp, functionName = "N/A", requestDetails = "N/A" }) => {
  return `${timestamp} [${level.toUpperCase()}] [${functionName}] [${requestDetails}] ${message}`;
});


//create logger instance
const logger = winston.createLogger({
  level: "silly", // Logs all levels from 'silly' to 'error'
  format: winston.format.combine(
    winston.format.timestamp(),
    customFormat // Removed winston.format.json() to avoid conflict
  ),
  transports: [
    new winston.transports.File({ filename: "error.log" }),
    new winston.transports.Console(),
  ],
});

export default logger;
