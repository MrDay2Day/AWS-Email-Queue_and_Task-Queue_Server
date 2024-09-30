import express from "express";
import EmailController from "../controllers/EmailController";
import { files } from "../../middleware/multer";

const emailRouter = express.Router();

emailRouter.post("/add", files, EmailController.addToQueue);

export default emailRouter;
