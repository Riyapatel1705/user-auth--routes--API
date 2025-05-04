import express from "express";
import { createOrganization } from "../controller/OrganizationController.js";
const OrganizationRouter = express.Router();



OrganizationRouter.post("/api/create/organization",createOrganization);

export {OrganizationRouter};
