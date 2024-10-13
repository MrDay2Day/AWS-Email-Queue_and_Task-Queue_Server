import mysql from "mysql2/promise";
import {
  checkAndCreateMySQLDatabase,
  createMySQLTables,
} from "../../app/models/database/mysql/trigger";
import { text_bright_magenta } from "../../utils/serverDataInfo";
const sql_promise = mysql;

export type MySQLConnectionType = {
  host: string;
  database?: string;
  user: string;
  password: string;
};

export const mysql_connection_data: MySQLConnectionType = {
  host: process.env.MYSQL_HOST || "",
  user: process.env.MYSQL_USER || "",
  password: process.env.MYSQL_PASS || "",
};

export const mysql_connection_data_with_database: MySQLConnectionType = {
  host: process.env.MYSQL_HOST || "",
  database: process.env.MYSQL_DB || "",
  user: process.env.MYSQL_USER || "",
  password: process.env.MYSQL_PASS || "",
};

// export const sql_pool = process.env.MYSQL_ACTIVE
//   ? sql_promise.createConnection(connection_data)
//   : null;

export const sql_pool = async function (configuration: MySQLConnectionType) {
  return await sql_promise.createConnection(configuration);
};

/**To access SQL server
 * @description This is a async function that allows queries and more to the database
 * @example
 * const sql = await connect_sql();
 *
 * const [query_res] = (await sql.query(
 *  `select * from demo where id = ?`,
 *  [ 23, ])
 * ) as {
 *  name: string;
 *  age: number,
 *  id: number;
 * }
 *
 * const demo = query_res[0];
 *
 * sql.end();
 */
export const connect_sql = async function () {
  return await sql_promise.createConnection(
    mysql_connection_data_with_database
  );
};

export function ConnectMySQL(): Promise<{
  valid: Boolean;
  [key: string]: any;
}> {
  console.log(text_bright_magenta("\tCONNECTING TO MYSQL DATABASE..."));
  return new Promise(async function (resolve, reject) {
    try {
      await checkAndCreateMySQLDatabase();
      let my_sql_access = await sql_pool(mysql_connection_data_with_database);

      await createMySQLTables(my_sql_access);
      const data = await my_sql_access.connect();
      my_sql_access.end();

      console.log(text_bright_magenta("\tMYSQL DATABASE CONNECTED!\n"));
      resolve({ valid: true, data });
    } catch (error) {
      // console.log("MySQL Connection Retry in 10s");
      // setTimeout(() => ConnectMySQL(), 10000);
      reject({ valid: false, error });
    }
  });
}
