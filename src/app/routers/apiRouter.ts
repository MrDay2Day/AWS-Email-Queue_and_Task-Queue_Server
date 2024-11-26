import express from "express";

import APIController from "../controllers/APIController";

const emailRouter = express.Router();

emailRouter.post("/create", APIController.addAPI);
emailRouter.post("/delete", APIController.deleteAPIKey);
emailRouter.post("/verify", APIController.verify);

export default emailRouter;
