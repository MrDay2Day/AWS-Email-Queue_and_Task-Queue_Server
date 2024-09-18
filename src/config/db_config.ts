import http from "http";

import { ConnectMongoDB } from "./mongo/config";
import { ConnectMySQL } from "./mysql/config";
import { ConnectPostGres } from "./postgres/config";
import { start_server } from "./server_config";

console.log("INITIALIZING DATABASE CONNECTION...");

const database = {
  mongodb: false,
  mysql: false,
  postgres: false,
};

type DatabaseType = typeof database;

class DBConfiguration {
  static async initiate(
    server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
  ) {
    try {
      if (process.env.MONGO_ACTIVE) {
        const check = await ConnectMongoDB();
        if (check.valid) {
          database.mongodb = true;
        }
      }

      if (process.env.PG_ACTIVE) {
        const check = await ConnectPostGres();
        if (check.valid) {
          database.postgres = true;
        }
      }

      if (process.env.MYSQL_ACTIVE) {
        const check = await ConnectMySQL();
        if (check.valid) {
          database.mysql = true;
        }
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
