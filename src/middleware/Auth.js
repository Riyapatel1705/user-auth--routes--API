import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const Authorization = (req, res, next) => {
  try {
    console.log("Request Headers:", req.headers);

    const authHeader = req.header("Authorization");
    
    if (!authHeader) {
      return res
        .status(401)
        .json({ error: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1]; // Bearer <token>

    if (!token) {
      return res
        .status(401)
        .json({ error: "Access denied. Invalid token format." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Decoded Token:", decoded); // To check if id & email present

    req.user = {
      id:decoded.id,
      email:decoded.email,
      name:decoded.name,
    }; // Attach user info to request

    next(); // Pass to next controller
  } catch (err) {
    console.error("Auth Middleware Error:", err.message);
    res.status(401).json({ error: "Invalid or expired token." });
  }
};
