import express from "express";
import QueueController from "../controllers/QueueController";

const queueRouter = express.Router();

queueRouter.post("/add", QueueController.addToQueue);
queueRouter.post("/remove", QueueController.removeFromQueue);

export default queueRouter;
