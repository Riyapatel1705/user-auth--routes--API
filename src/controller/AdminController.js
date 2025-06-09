import { Admin } from "../db/models/Admin.js";
import jwt from 'jsonwebtoken';

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
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  export const loginAdmin = async (req, res) => {
    const { Admin_id, email } = req.body;
    
    if (!Admin_id || !email) {
        return res.status(400).json({ message: "Admin_id and email are required" });
    }

    try {
        const admin = await Admin.findOne({
            where: { Admin_id, email }
        });

        if (!admin) {
            return res.status(401).json({ message: "Admin does not exist or invalid credentials" });
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
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = parseInt(id);
        if (isNaN(adminId)) {
            return res.status(400).json({ message: "Invalid admin ID" });
        }

        const isAdmin = await Admin.findOne({ where: { id: adminId } });

        if (!isAdmin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        await Admin.destroy({ where: { id: adminId } });

        return res.status(200).json({ message: "Admin has been deleted successfully!" });

    } catch (err) {
        console.error("Error in deleteAdmin:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};
