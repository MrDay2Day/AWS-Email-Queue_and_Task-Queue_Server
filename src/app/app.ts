import express from "express";
const mainRouter = express.Router();

import routes from "./routes";
import { auth } from "./routers/utils/auth";

// Main router
mainRouter.use("/server", auth, routes);

export default mainRouter;
