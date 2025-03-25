import { User } from '../models/User.js';

// Update user info
export const update = async (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, email,updated_by,updated_at } = req.body;

    try{
        const user= await User.findByPk(id);

        if(!user){
            return res.status(404).json({message:"User doesn't exist!"});
        }
        await user.update({first_name,last_name,email,updated_by,updated_at});
        res.status(200).json({message:'User updated successfully!'});
    }catch(err){
        console.error('Error updating user:',err);
        res.status(500).json({message:'Error updating user'});
    }
};

//Delete user
export const deleteUser=async(req,res)=>{
    const{id}=req.params;

    try{
        const user= await User.findByPk(id);

        if(!user){
            return res.status(404).json({message:'User not found'});
        }

        await user.destroy();
        res.json({message:'User deleted successfully'});
    }catch(err){
        console.error('Error deleting user:',err);
        res.status(500).json({message:'Error deleting user'});
    }
};