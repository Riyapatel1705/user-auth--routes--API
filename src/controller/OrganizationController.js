import { Organization } from '../db/models/Organization.js';
import { Admin } from '../db/models/Admin.js';

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

