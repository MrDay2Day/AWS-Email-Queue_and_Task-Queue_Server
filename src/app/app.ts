import express from "express";
const mainRouter = express.Router();

import routes from "./routes";
import { auth } from "./routers/utils/auth";
import trackerRouter from "./routers/trackerRouter";

// Main router
mainRouter.use("/server", auth, routes);
mainRouter.use(trackerRouter);

export default mainRouter;
