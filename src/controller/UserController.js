import { User } from "../db/models/User.js";
import Sentry from "@sentry/node";
import { CustomError } from "../utils/CustomError.js";
//update user info

export const update = async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, password, updated_by } = req.body;
  try {
    const user = await User.findByPk(id);

    if (!user) {
      throw new CustomError("user does not exists",400,"USER_DOESN'T EXISTS");
    }
    await user.update({
      first_name,
      last_name,
      email,
      password,
      updated_by,
    });
    res.status(200).json({ message: "User updated successfully!" });
  } catch (err) {
    console.error("Error updating user:", err);
    if(err instanceof CustomError){
          throw err;
        }
        Sentry.captureException(err);
        throw new CustomError("internal server error",500,"FAILED_TO_UPDATE");
    //throw new CustomError("internal server error",500,"DATABASE_ERROR");
  }
};

//delete user
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);

    if (!user) {
     throw new CustomError("user does not exists",400,"USER_DOESN'T EXISTS");
    }

    await user.destroy();
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    if(err instanceof CustomError){
          throw err;
        }
        Sentry.captureException(err);
        throw new CustomError("internal server error",500,"FAILED_TO_DELETE");
    //throw new CustomError("internal server error",500,"DATABASE_ERROR");
  }
};
