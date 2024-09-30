import express from "express";
const routes = express.Router();

import emailRouter from "./routers/emailRouter";
import queueRouter from "./routers/queueRouter";
import apiRouter from "./routers/apiRouter";
import Misc from "./routers/utils/misc";

routes.use("/email", emailRouter);
routes.use("/queue", queueRouter);
routes.use("/api", apiRouter);
routes.use("/ping", Misc.ping);

routes.use("/*", Misc.error404);

export default routes;
