import express from "express";
import EmailController from "../controllers/EmailController";
import { files, html } from "../../middleware/multer";

const emailRouter = express.Router();

emailRouter.post("/add", files, EmailController.addToQueue);
emailRouter.post("/add-template", html, EmailController.addTemplate);
emailRouter.post("/list-templates", EmailController.listTemplates);
emailRouter.post(
  "/fetch-specific-records",
  EmailController.fetchSpecificEmails
);
emailRouter.post("/fetch-api-records", EmailController.fetchEmailsRecords);
emailRouter.post("/remove-template", EmailController.removeTemplate);

export default emailRouter;
