import http from "http";

import { ConnectMySQL } from "./mysql/config";
import { start_server } from "./server_config";

console.log("INITIALIZING DATABASE CONNECTION...");

const database = {
  mysql: false,
};

type DatabaseType = typeof database;

class DBConfiguration {
  static async initiate(
    server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
  ) {
    try {
      const check = await ConnectMySQL();
      if (check.valid) {
        database.mysql = true;
      }

      return start_server(server);
    } catch (error) {
      //
      console.log("DBConfiguration.initiate", { error });
    }
  }

  static database_status(): DatabaseType {
    return database;
  }
}

export default DBConfiguration;
