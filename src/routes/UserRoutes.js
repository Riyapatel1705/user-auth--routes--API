import express from "express";
import { deleteUser, update } from "../controller/UserController.js";
import { registerAdmin,deleteAdmin,loginAdmin } from "../controller/AdminController.js";
import { Authorization } from "../middleware/Auth.js";
const UserRouter = express.Router();

//user update Route
UserRouter.put("/api/update/:id", Authorization, update);

//delete user Route
UserRouter.delete("/api/delete/:id", Authorization, deleteUser);

UserRouter.post("/api/register/admin",registerAdmin);

UserRouter.delete("/api/delete/admin/:id",Authorization,deleteAdmin);

UserRouter.post("/api/Admin/login",loginAdmin)

export { UserRouter };
