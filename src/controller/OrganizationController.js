import { Organization } from '../db/models/Organization.js';
import { Admin } from '../db/models/Admin.js';
import { where } from 'sequelize';

export const createOrganization=async(req,res)=>{
    const{Admin_id}=req.query;
    if(!Admin_id){
        return res.status(400).json({message:"Please Provide Admin_id!"});
    }
        const {organization_name,organization_type,contact_email,website}=req.body;
        const requiredFields=['organization_name','organization_type','contact_email'];
        const missingFields=requiredFields.filter(
            (field)=>
                 req.body[field]===undefined||
                 req.body[field] === null ||
                 req.body[field] === ""
        );
        if(missingFields.length>0){
            return res.status(400).send({
                message: `Please fill all the required fields: ${missingFields.join(", ")}`,
              });
        }
        try{
            const admin=await Admin.findOne({where:{Admin_id}});
            if(!admin){
                return res.status(400).json({message:"No admin found for this ID"});
            }
            const organization = await Organization.create({
                admin_id: Admin_id,
                organization_name,
                organization_type,
                contact_email,
                website
              });
              
            if(!organization){
                return res.status(400).json({message:"Error in creating organization"});
            }
            return res.status(200).json({message:"Organization created Successfully",organization});
        }catch(err){
            console.log("Something wrong happened:",err.message);
            return res.status(500).json({message:"Internal server error"});
        }
    }
  // Update organization
export const updateOrganization = async (req, res) => {
    const { organization_name, organization_type, contact_email, website } = req.body;
    const { organization_id } = req.params; // Use URL params instead of query params

    if (!organization_id) {
        return res.status(400).json({ message: "Organization_id is required" });
    }

    try {
        const organization = await Organization.findOne({ where: { organization_id } });
        if (!organization) {
            return res.status(404).json({ message: "Organization does not exist!" });
        }

        // Update organization
        await organization.update({
            organization_name,
            organization_type,
            contact_email,
            website
        });

        return res.status(200).json({ message: "Organization updated successfully!" });

    } catch (err) {
        console.error("Error updating organization:", err.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Delete organization
export const deleteOrganization = async (req, res) => {
    const { organization_id } = req.params; // Use URL params instead of query params

    if (!organization_id) {
        return res.status(400).json({ message: "Organization_id is required" });
    }

    try {
        const organization = await Organization.findOne({ where: { organization_id } });
        if (!organization) {
            return res.status(404).json({ message: "Organization does not exist!" });
        }

        // Delete the organization
        await organization.destroy();
        return res.status(200).json({ message: "Organization deleted successfully!" });

    } catch (err) {
        console.error("Error deleting organization:", err.message);
        return res.status(500).json({ message: "Internal server error!" });
    }
};
