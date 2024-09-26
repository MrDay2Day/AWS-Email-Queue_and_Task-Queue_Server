import http from "http";
import { v4 as uuidv4 } from "uuid";
import {
  serverDataInfo,
  text_bright,
  text_bright_blue,
  text_bright_green,
  text_bright_red,
} from "../utils/serverDataInfo";

export const serverInstanceId = String(uuidv4()).toUpperCase();
export function start_server(
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
) {
  /**Server Instance ID is created to track all instances of the server*/
  console.log(
    `\n${text_bright_green("SERVER INSTANCE ID: ")}${text_bright(
      serverInstanceId
    )}\n`
  );
  server.listen(Number(process.env.PORT || ""), async () => {
    console.log(text_bright(`\n**************************************\n`));
    console.log(
      text_bright(
        `    ${text_bright_red(process.env.APP_NAME || "")}${text_bright(
          " RUNNING ON PORT --> "
        )}${text_bright_blue(process.env.PORT || "")}`
      )
    );
    console.log(text_bright(`\n**************************************\n`));
  });
  serverDataInfo(server);
}
