import { getIO } from "../../utils/socket";
import { Socket } from "socket.io";
import http from "http";

import { verifyToken } from "../utils/jwt";
import { v4 as uuidv4 } from "uuid";

/**
  Recommendation 
  
  Assign each of your users a "socket_room_id" that is ONLY known on the server and never goes to the front end, after a user 'signs in'/'logs in' then send a post (with the socket connection id) or get request ()with the socket connection id as a query or params) to use the "joinSocketRoom" function to add the "socket.id" to the users private socket room. 

  When sending any message use the user's "id". When the message is sent to the user's "id" fetch the user's "socket_room_id" and then send message to that room.

  @function listenerFunc 
  @description The default listeners for each socket connection.
  
  @function joinSocketRoom 
  @description To add socket connection to user's socket room.
  
  @function validate_socket 
  @description To validate each socket connection.
  

 */
class SocketEngine {
  /**
   * Socket Listening Procedure
   *
   * @param {Socket} socket Socket connection.
   * @param {Request} request The Request connection that came with the socket connection.
   * @param {string} serverInstanceId The server instance ID which is unique to each instance of the server
   *
   */
  static async listenerFunc(
    socket: Socket,
    request: http.IncomingMessage,
    serverInstanceId: string
  ) {
    console.log(request.headers);
    socket.onAny(async (event: string) => {
      console.log({ event }, socket.data);
    });

    /**Examples of general socket listeners */
    socket.on("ping", async (data, callback) => {
      try {
        const io = getIO();
        /**This function should be used to validate socket connection that it is associated with a valid user. */
        await this.validate_socket(socket);
        console.log("Received PING data:", {
          data,
        });
        const response = { valid: true, serverInstanceId, time: new Date() };
        /**Example -> Sending a socket message, this message is sent to all who are listening to the "all" event.
         * Also this message, if redis/keydb is enabled is distributed to all server instances that are connected to the Pub/Sub connection.
         */
        io.to(data.to).emit("hello", data);
        /**Callback used to send data back to the client if applicable. */
        if (callback) callback(response);
      } catch (err) {
        console.log({ err });
      }
    });

    socket.on("demo", async (data, callback) => {
      try {
        /**This function should be used to validate socket connection that it is associated with a valid user. */
        await this.validate_socket(socket);
        console.log("Received Demo data:", {
          data,
        });
        /**Callback used to send data back to the client if applicable. */
        if (callback)
          callback({ valid: true, serverInstanceId, time: new Date() });
      } catch (err) {
        console.log({ err });
      }
    });
  }

  /**
   *
   * @param {string} socketRoom The unique socket room id for each user.
   * @param {string} socketId The new socket connection ID to be added to the socket room.
   *
   * @returns {Promise<Boolean>} Returns a promise true | false if the socket was added to the socket room.
   */
  static async joinSocketRoom(
    socketRoom: string,
    socketId: string
  ): Promise<Boolean> {
    try {
      console.log({ socketRoom, socketId });
      /** Establishing SocketIO Server Access */
      const io = getIO();

      /** getting the socket connection instance for the ID */
      const socket = io.sockets.sockets.get(socketId);

      /** Adding socket id to the user's private socket room */
      if (socketRoom) {
        socket?.join(socketRoom);
      }

      /** Getting a list of the main socket room */
      const main_socket_room = io.sockets.adapter.rooms.get(
        process.env.APP_MAIN_SOCKET_ROOM || "main_socket_room"
      );

      /** Add socket connection to the main socket room */
      if (main_socket_room) {
        /** Checking if main socket room has the new ID */
        const has_socket_conn = main_socket_room.has(socketId);
        if (!has_socket_conn) {
          socket?.join(process.env.APP_MAIN_SOCKET_ROOM || "main_socket_room");
        }
      } else {
        /** If the room does not exist on this server it will be created upon adding the ID */
        socket?.join(process.env.APP_MAIN_SOCKET_ROOM || "main_socket_room");
      }

      console.log(`${socketRoom} IDs`, {
        ids: io.sockets.adapter.rooms.get(socketRoom),
      });
      return true;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Validate socket connection with "socket_room_id" method.
   *
   * When a socket is sending a message you SHOULD send the user's id when the event is triggered fetch the user info which will include the user's "socket_room_id" then check if that "socket.id" from the socket connection is in the user's private socket room, if it is then the message can be sent else throw an error.
   *
   * @param {string} socket The socket connection to validate if it belongs to a verified user.
   * @returns {Promise<Boolean>} Returns a promise true | false if the connection is valid.
   */
  static async validate_socket(socket: Socket): Promise<Boolean> {
    try {
      const socket_id = socket.id;

      if (!socket_id) {
        throw new Error("Not Authenticated.");
      }

      return true;
    } catch (error) {
      console.log({ error });
      return false;
    }
  }
}

export default SocketEngine;
