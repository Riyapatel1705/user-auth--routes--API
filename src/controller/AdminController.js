import { Admin } from "../db/models/Admin.js";
import jwt from 'jsonwebtoken';
import Sentry from "@sentry/node";
import { CustomError } from "../utils/CustomError.js";

export const registerAdmin = async (req, res) => {
    try {
      const { Admin_id, name, role, email } = req.body;
  
      // Step 1: Validate required fields
      if (!Admin_id || !name || !role) {
        return res.status(400).json({ message: "Admin_id, name, and role are required." });
      }
  
      // Step 2: Log inputs
      console.log("Registering admin with data:", { Admin_id, name, role, email });
  
      // Step 3: Attempt to create the admin
      const admin = await Admin.create({ Admin_id, name, role, email });
  
      // Step 4: Respond with success
      return res.status(200).json({ message: "Admin created successfully", admin });
  
    } catch (err) {
      // Step 5: Log the full error
      console.error("Error in registerAdmin:", err); // Not just err.message
  
      // Step 6: Send error response
      throw new CustomError("internal server error",500,"FAILED_TO_REGISTER_ADMIN");
     }
  };

  export const loginAdmin = async (req, res) => {
    const { Admin_id, email } = req.body;
    console.log("Login API Hit");

    if (!Admin_id || !email) {
        throw new CustomError("admin id and email are required",500,"ADMIN_ID AND EMAIL IS REQUIRED");
    }

    try {
        const admin = await Admin.findOne({
            where: { Admin_id, email }
        });

        if (!admin) {
            throw new CustomError("admin does not exists",404,"ADMIN_NOT_FOUND");
        }

        const role = admin.role;

        const token = jwt.sign(
            { id: admin.Admin_id, email: admin.email, role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.json({ token });
    } catch (err) {
        console.error("Error during login:", err);
        throw new CustomError("internal server error",500,"FAILED_TO_LOGIN_ADMIN");
    }
};


export const deleteAdmin = async (req, res) => {
    try {
        const { id } = req.query; 

        if (!id) {
            throw new CustomError("no id provided",400,"ADMIN_ID_REQUIRED");
        }

        const isAdmin = await Admin.findOne({ where: { id } });

        if (!isAdmin) {
            throw new CustomError("user is not admin",401,"UNAUTHORIZED_USER");
        }

        const deleteAdmin = await Admin.destroy({ where: { id } });

        if (!deleteAdmin) {
            throw new CustomError("not able to delete admin",400,"UNABLE_TO_DELETE_ADMIN");
        }

        return res.status(200).json({ message: "Admin has been deleted successfully!" });

    } catch (err) {
        throw new CustomError("internal server error",500,"FAILED_TO_DELETE_ADMIN");
    }
};
