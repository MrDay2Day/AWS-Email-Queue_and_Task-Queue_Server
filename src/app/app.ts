import express from "express";
const mainRouter = express.Router();

import routes from "./routes";

// Main router
mainRouter.use("/server", routes);

export default mainRouter;
