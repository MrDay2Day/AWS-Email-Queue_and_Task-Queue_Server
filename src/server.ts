process
  .on("warning", (e) => console.warn(e.stack))
  .on("unhandledRejection", (reason, p) =>
    console.log(reason, `Unhandled Rejection at Promise - ${p}`)
  )
  .on("uncaughtException", (exception_err) =>
    console.log(exception_err, "Uncaught Exception Error")
  )
  .on("APP STACK WARNING", (e) => console.warn(e.stack));

import dotenv from "dotenv";
dotenv.config();

import { app } from "./middleware/modules";
import mainRouter from "./app/app";
import http from "http";
import DBConfiguration from "./config/db_config";
import { text_bright, text_bright_red } from "./utils/serverDataInfo";

function start(): void {
  try {
    console.log(
      text_bright(`
\n\n\n\n\n
**************************************\n
    START `) +
        `${text_bright_red(process.env.APP_NAME || "")}` +
        text_bright(` SERVER\n
**************************************\n`)
    );
    console.log("INITIALIZING MIDDLEWARE AND ENDPOINTS...");
    app.use("/", mainRouter);
    console.log("INITIALIZATION COMPLETE!");

    console.log("INITIALIZING SERVER...");
    const server = http.createServer(app);
    console.log("WEBSERVER INITIALIZED!\n");
    DBConfiguration.initiate(server);
  } catch (error) {
    console.log("SERVER ERROR", { error });
    start();
  }
}

start();
