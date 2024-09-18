import http from "http";

export const text_black = (input: string): string =>
  "\x1b[30m" + input + "\x1b[0m";
export const text_red = (input: string): string =>
  "\x1b[31m" + input + "\x1b[0m";
export const text_green = (input: string): string =>
  "\x1b[32m" + input + "\x1b[0m";
export const text_yellow = (input: string): string =>
  "\x1b[33m" + input + "\x1b[0m";
export const text_blue = (input: string): string =>
  "\x1b[34m" + input + "\x1b[0m";
export const text_magenta = (input: string): string =>
  "\x1b[35m" + input + "\x1b[0m";
export const text_cyan = (input: any): string => "\x1b[36m" + input + "\x1b[0m";
export const text_white = (input: string): string =>
  "\x1b[37m" + input + "\x1b[0m";

// Bright colors
export const text_bright = (input: string) => "\x1b[1m" + input + "\x1b[0m";
export const text_bright_black = (input: string): string =>
  "\x1b[90m" + input + "\x1b[0m";
export const text_bright_red = (input: string): string =>
  "\x1b[91m" + input + "\x1b[0m";
export const text_bright_green = (input: string): string =>
  "\x1b[92m" + input + "\x1b[0m";
export const text_bright_yellow = (input: string): string =>
  "\x1b[93m" + input + "\x1b[0m";
export const text_bright_blue = (input: string): string =>
  "\x1b[94m" + input + "\x1b[0m";
export const text_bright_magenta = (input: string): string =>
  "\x1b[95m" + input + "\x1b[0m";
export const text_bright_cyan = (input: any): string =>
  "\x1b[96m" + input + "\x1b[0m";
export const text_bright_white = (input: string): string =>
  "\x1b[97m" + input + "\x1b[0m";

// Underscored colors
export const text_black_underscore = (input: string): string =>
  "\x1b[38;5;232m" + input + "\x1b[0m";
export const text_red_underscore = (input: string): string =>
  "\x1b[38;5;196m" + input + "\x1b[0m";
export const text_green_underscore = (input: string): string =>
  "\x1b[38;5;102m" + input + "\x1b[0m";
export const text_yellow_underscore = (input: string): string =>
  "\x1b[38;5;226m" + input + "\x1b[0m";
export const text_blue_underscore = (input: string): string =>
  "\x1b[38;5;49m" + input + "\x1b[0m";
export const text_magenta_underscore = (input: string): string =>
  "\x1b[38;5;125m" + input + "\x1b[0m";
export const text_cyan_underscore = (input: any): string =>
  "\x1b[38;5;51m" + input + "\x1b[0m";
export const text_white_underscore = (input: string): string =>
  "\x1b[38;5;255m" + input + "\x1b[0m";

export const serverDataInfo = (
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
) => {
  let data_totalOut = 0;
  let data_totalIn = 0;
  let data_allTime_totalOut = 0;
  let data_allTime_totalIn = 0;
  let date = 0;
  const hrs_24 = 86400000;

  const moment = require("moment");
  const requestStats = require("request-stats");
  const stats = requestStats(server);

  stats.on("complete", async (details: any) => {
    if (!date) {
      date = Date.now();
    }
    if (date - Date.now() >= hrs_24) {
      data_totalOut = 0;
      data_totalIn = 0;
    }

    // console.log({ res: details.res });

    var socketIp = null;
    if (details.req.socket) {
      if (details.req.socket.remoteAddress) {
        socketIp = details.req.socket.remoteAddress;
      }
    }

    var ip = socketIp || details.req.headers["x-real-ip"] || "N/A";

    data_totalIn = data_totalIn + details.req.bytes;
    data_totalOut = data_totalOut + details.res.bytes;
    data_allTime_totalIn = data_totalIn;
    data_allTime_totalOut = data_totalOut;

    console.log(
      `ip: ${text_cyan(ip)}, ${text_bright("<--")}: ${text_yellow(
        String(data_allTime_totalIn / 1000)
      )}, ${text_bright("-->")}: ${text_red(
        String(data_allTime_totalOut / 1000)
      )}, time: ${moment().format("MMMM Do YYYY, h:mm:ss a")}`
    );
  });
};
