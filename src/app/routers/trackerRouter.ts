import express from "express";
import TrackerController from "../controllers/TrackerController";

const trackerRouter = express.Router();

trackerRouter.get("/identifier", TrackerController.openEmails);
trackerRouter.post(
  "/email-status",
  express.text({ type: "text/plain" }),
  TrackerController.emailStatus
);

export default trackerRouter;
