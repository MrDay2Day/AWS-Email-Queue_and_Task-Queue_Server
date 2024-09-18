import { Connection, RowDataPacket } from "mysql2/promise";
import {
  mysql_connection_data,
  sql_pool,
} from "../../../../config/mysql/config";
import { mysql_tables } from "./schemas/tables";
import { text_magenta } from "../../../../utils/serverDataInfo";

export async function checkAndCreateMySQLDatabase(): Promise<boolean> {
  // Create a connection to the MySQL server
  let connection: Connection | undefined;

  try {
    if (sql_pool) {
      connection = await sql_pool(mysql_connection_data);
      if (typeof connection === "undefined")
        throw { msg: "MySQL Connection missing." };

      const databaseName: string = process.env.MYSQL_DB || ""; // Replace with your desired database name

      // Check if the database exists
      const [databases]: [RowDataPacket[], any] = await connection.query<
        RowDataPacket[]
      >("SHOW DATABASES LIKE ?", [databaseName]);

      if (databases.length === 0) {
        // Create the database if it does not exist
        await connection.query(`CREATE DATABASE ${databaseName}`);
        console.log(
          text_magenta(
            `\t\t-> MySQL Database "${databaseName}" created successfully.`
          )
        );
        return true;
      } else {
        console.log(
          text_magenta(
            `\t\t-> MySQL Database "${databaseName}" already exists.`
          )
        );
      }
    } else {
      throw { msg: "Server Not initiated." };
    }
  } catch (error) {
    console.error("Error:", error);
    throw error;
  } finally {
    // Ensure the connection is closed
    if (connection) {
      await connection.end();
    }
  }
  return false;
}

export async function createMySQLTables(connection: Connection): Promise<{
  created: number;
  table_error: string[];
}> {
  let created: number = 0;
  let table_error: string[] = [];
  try {
    if (typeof connection === "undefined")
      throw { msg: "MySQL Connection missing." };

    for (const table of mysql_tables) {
      const table_data = table();
      try {
        if (connection) {
          const [tables]: [RowDataPacket[], any] = await connection.query<
            RowDataPacket[]
          >("SHOW TABLES LIKE ?", [table_data.table_name]);

          if (tables.length === 0) {
            // Execute the SQL statement
            await connection.execute(table_data.script);
            created++;
            console.log(
              text_magenta(
                `\t\t-> MySQL Table ${table_data.table_name} created successfully.`
              )
            );
          } else {
            console.log(
              text_magenta(
                `\t\t-> MySQL Table ${table_data.table_name} already exists.`
              )
            );
          }
        } else {
          throw false;
        }
      } catch (error) {
        console.log("createMySQLTables", { error });
        table_error.push(table_data.table_name);
      }
    }

    return { created, table_error };
  } catch (error) {
    console.error("Error:", error);
    throw error;
  } finally {
    // Ensure the connection is closed
    if (connection) {
      await connection.end();
    }
  }
}
