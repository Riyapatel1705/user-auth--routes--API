import { Organization } from '../db/models/Organization.js';
import { Admin } from '../db/models/Admin.js';
import { where } from 'sequelize';
import Sentry from "@sentry/node";
import { CustomError } from '../utils/CustomError.js';

export const createOrganization=async(req,res)=>{
    const{Admin_id}=req.query;
    if(!Admin_id){
        throw new CustomError("admin id is not provided",400,"NO_ADMINID_PROVIDED");
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
                throw new CustomError("admin not found",400,ADMIN_NOT_FOUND);
            }
            const organization = await Organization.create({
                admin_id: Admin_id,
                organization_name,
                organization_type,
                contact_email,
                website
              });
              
            if(!organization){
                throw new CustomError("error in creating organization",400,"FAILED_TO_CREATE_ORGANIZATION");
            }
            return res.status(200).json({message:"Organization created Successfully",organization});
        }catch(err){
            console.log("Something wrong happened:",err.message);
            if(err instanceof CustomError){
                  throw err;
                }
                Sentry.captureException(err);
                throw new CustomError("internal server error",500,"FAILED_TO_CREATE")
            //throw new CustomError("internal server error",500,"DATABASE_ERROR");
        }
    }
  // Update organization
export const updateOrganization = async (req, res) => {
    const { organization_name, organization_type, contact_email, website } = req.body;
    const { organization_id } = req.params; // Use URL params instead of query params

    if (!organization_id) {
        throw new CustomError("organization id is not provided",400,"NO_ORGANIZATIONID_PROVIDED");
    }

    try {
        const organization = await Organization.findOne({ where: { organization_id } });
        if (!organization) {
            throw new CustomError("there is no organization exists",400,"NO_ORGANIZATION_EXISTS");
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
       if(err instanceof CustomError){
             throw err;
           }
           Sentry.captureException(err);
           throw new CustomError("internal server error",500,"FAILED_TO_UPDATE");
        // throw new CustomError("internal server error",500,"DATABASE_ERROR");
    }
};

// Delete organization
export const deleteOrganization = async (req, res) => {
    const { organization_id } = req.params; // Use URL params instead of query params

    if (!organization_id) {
            throw new CustomError("organization id is not provided",400,"NO_ORGANIZATIONID_PROVIDED");
        }

    try {
        const organization = await Organization.findOne({ where: { organization_id } });
        if (!organization) {
            throw new CustomError("there is no organization exists",400,"NO_ORGANIZATION_EXISTS");
        }

        // Delete the organization
        await organization.destroy();
        return res.status(200).json({ message: "Organization deleted successfully!" });

    } catch (err) {
        console.error("Error deleting organization:", err.message);
        if(err instanceof CustomError){
              throw err;
            }
            Sentry.captureException(err);
            throw new CustomError("internal server error",500,"FAILED_TO_DELETE");
        // throw new CustomError("internal server error",500,"DATABASE_ERROR");
    }
};
