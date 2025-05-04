import { Admin } from "../db/models/Admin.js";

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

export const deleteAdmin = async (req, res) => {
    try {
        const { id } = req.query; 

        if (!id) {
            return res.status(400).json({ message: "No admin ID has been provided" });
        }

        const isAdmin = await Admin.findOne({ where: { id } });

        if (!isAdmin) {
            return res.status(401).json({ message: "The user is not an admin" });
        }

        const deleteAdmin = await Admin.destroy({ where: { id } });

        if (!deleteAdmin) {
            return res.status(400).json({ message: "Unable to delete admin" });
        }

        return res.status(200).json({ message: "Admin has been deleted successfully!" });

    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
};
