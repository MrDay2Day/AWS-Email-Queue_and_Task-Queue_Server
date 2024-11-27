import mysql, {
  Connection,
  ConnectionOptions,
  FieldPacket,
  QueryResult,
} from "mysql2/promise";
import {
  checkAndCreateMySQLDatabase,
  createMySQLTables,
} from "../../app/models/database/mysql/trigger";
import { text_bright_magenta } from "../../utils/serverDataInfo";
import { typeExtractor } from "../../app/utils/typeExtractor";
const sql_promise = mysql;

export let sql_conn: Connection;

export type MySQLConnectionType = {
  host: string;
  database?: string;
  user: string;
  password: string;
};

let PORT: number = 0;

const [port_err, port_info] = typeExtractor(process.env.PORT);
if (port_err) {
  PORT = 3306;
}
if (
  port_info &&
  port_info[0] === "number" &&
  typeof port_info[1] === "number"
) {
  PORT = port_info[1];
}

export const mysql_connection_data: ConnectionOptions & MySQLConnectionType = {
  host: process.env.MYSQL_HOST || "",
  // port: PORT,
  user: process.env.MYSQL_USER || "",
  password: process.env.MYSQL_PASS || "",
  connectionLimit: 20,
  waitForConnections: true,
  enableKeepAlive: true,
};

export const mysql_connection_data_with_database: ConnectionOptions &
  MySQLConnectionType = {
  host: process.env.MYSQL_HOST || "",
  // port: PORT,
  database: process.env.MYSQL_DB || "",
  user: process.env.MYSQL_USER || "",
  password: process.env.MYSQL_PASS || "",
  connectionLimit: 130,
  queueLimit: 0,
  waitForConnections: true,
  enableKeepAlive: true,
};

// export const sql_pool = process.env.MYSQL_ACTIVE
//   ? sql_promise.createConnection(connection_data)
//   : null;

let sql_connected: boolean = false;

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
  await ConnectMySQL();

  return await sql_pool(mysql_connection_data_with_database);
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
      sql_connected = true;
      await my_sql_access.end();

      sql_conn = await sql_pool(mysql_connection_data_with_database);

      console.log(text_bright_magenta("\tMYSQL DATABASE CONNECTED!\n"));
      resolve({ valid: true, data });
    } catch (error) {
      // console.log("MySQL Connection Retry in 10s");
      // setTimeout(() => ConnectMySQL(), 10000);
      reject({ valid: false, error });
    }
  });
}

async function checkConnection(connection: mysql.Connection): Promise<boolean> {
  try {
    // Try executing a simple query to check if the connection is still alive
    await connection.query("SELECT 1");
    return true; // Connection is open
  } catch (err) {
    console.error("Connection error:", err);
    return false; // Connection is closed or has an error
  }
}

export class sql {
  static async query<T extends QueryResult>(
    qry: string,
    qry_var: any[]
  ): Promise<[T, FieldPacket[]]> {
    const check = await checkConnection(sql_conn);
    if (check) {
      return await sql_conn.query(qry, qry_var);
    }

    sql_conn = await sql_pool(mysql_connection_data_with_database);
    return await sql_conn.query(qry, qry_var);
  }
}
