/** This files allows us to share our SocketIO connection across the application. */
console.log("INITIALIZING SOCKET CONNECTION...");

import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";
import { Server } from "socket.io";
import http from "http";

const pubClient =
  process.env.USE_REDIS === "y"
    ? createClient({
        url: process.env.REDIS_URL,
      })
    : null;

const subClient = process.env.USE_REDIS === "y" ? pubClient?.duplicate() : null;

export let io: Server;

let totalDataSent = 0;
export async function init(httpServer: http.Server) {
  io = new Server(httpServer, {
    // secure: true,
    cookie: true,
    pingTimeout: 30000,
    pingInterval: 30000,
    path: `/${process.env.APP_SOCKET_NAME}/`,
  });

  if (process.env.USE_REDIS === "y") {
    console.log("ATTEMPTING TO CONNECT TO REDIS SERVER!");
    let redisConnect = true;
    try {
      if (!pubClient?.isOpen) {
        await pubClient?.connect();
      }
    } catch (error) {
      redisConnect = false;
      console.log("REDIS PUBLISHING CLIENT UNABLE TO CONNECT!!!", error);
    }

    try {
      if (!subClient?.isOpen) {
        await subClient?.connect();
      }
    } catch (error) {
      redisConnect = false;
      console.log("REDIS SUBSCRIBING CLIENT UNABLE TO CONNECT!!!", error);
    }
    redisConnect ? io.adapter(createAdapter(pubClient, subClient)) : null;

    subClient?.on("connect", () => {
      console.log("REDIS SUBSCRIBING CLIENT CONNECTED!!!");
    });
    pubClient?.on("connect", () => {
      console.log("REDIS PUBLISHING CLIENT CONNECTED!!!");
    });
    subClient?.on("error", (redisErr: any | unknown) => {
      console.log({ redisErr });
    });
    pubClient?.on("error", (redisErr: any | unknown) => {
      console.log({ redisErr });
    });
    // console.log({ io });
    console.log("SECURE WEBSOCKET INITIALIZED!");
  }

  return io;
}

/**To get Access to Web socket
 * To use io
 *
 * @function getIO()
 *
 * @returns {Server} Server with socket connection
 *
 * @example Server Side
 *
 * const { getIO } = require("../socket");
 *
 * // General Emit to all sockets
 *
 * const io = getIO();
 * io.emit("event",
 *   {
 *     action: "create",
 *     data: { ... }
 *   }
 * );
 *
 * // Send to specific socket id  or room id
 *
 * const io = getIO();
 * const data = { action: "create" };
 *
 * io
 *   .to(<client/room_id>)
 *   .emit("reg_event", data);
 *
 * io
 *   .to(<client/room_id>)
 *   .emit("ack_demo", data, ack => ack && console.log(ack) );
 *   // "ack" is only applicable if receiver acknowledges message with a reply.
 *
 *
 * @example Client Side
 *
 * socket.on("reg_event", (data) => {
 *     console.log({ data })
 * });
 *
 * socket.on("ack_demo", (data, ack) => {
 *   if(data.action === "create"){
 *     console.log({ data })
 *     ack({ response: true });
 *   }else{
 *     ack({ response: false });
 *   };
 * });
 */
export function getIO(): Server {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  console.log("SOCKET.IO INITIALIZED!");
  return io;
}

export async function redisServer() {
  if (process.env.USE_REDIS === "y") {
    return pubClient?.duplicate();
  } else {
    return false;
  }
}
