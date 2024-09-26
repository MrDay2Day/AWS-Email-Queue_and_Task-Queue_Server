import express from "express";
import EmailController from "../controllers/EmailController";
import { common_files } from "../../middleware/multer";

const emailRouter = express.Router();

emailRouter.get("/add", common_files, EmailController.addToQueue);

export default emailRouter;
