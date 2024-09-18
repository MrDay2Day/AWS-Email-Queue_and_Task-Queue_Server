import { PoolConfig, Client } from "pg";

import { pg_tables } from "./schemas/tables";
import {
  pg_connection_data,
  query_pg,
} from "../../../../config/postgres/config";
import { text_yellow } from "../../../../utils/serverDataInfo";

export async function checkAndCreatePGDatabase(): Promise<boolean> {
  const client = new Client(pg_connection_data);

  const dbName = process.env.PG_DB;
  try {
    await client.connect();
    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname='${dbName}'`
    );
    if (res.rowCount === 0) {
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(
        text_yellow(`\t\t-> PG Database ${dbName} created successfully.`)
      );
      return true;
    } else {
      console.log(text_yellow(`\t\t-> PG Database ${dbName} already exists.`));
      return true;
    }
  } catch (err) {
    console.error(`Error creating pg database ${dbName}:`, err);
    return false;
  } finally {
    await client.end();
  }
}

export async function createPGTables(): Promise<{
  created: number;
  table_error: string[];
}> {
  let created: number = 0;
  let table_error: string[] = [];
  try {
    for (const table of pg_tables) {
      const table_data = table();
      try {
        const res = await query_pg(
          `SELECT 1 FROM information_schema.tables WHERE table_name=$1`,
          [table_data.table_name.toLowerCase()]
        );

        if (res.rowCount === 0) {
          await query_pg(table_data.script, []);
          console.log(
            text_yellow(
              `\t\t-> PG Table ${table_data.table_name} created successfully.`
            )
          );
        } else {
          console.log(
            text_yellow(
              `\t\t-> PG Table ${table_data.table_name} already exists.`
            )
          );
        }
      } catch (error) {
        console.log("createPGTables", { error });
        table_error.push(table_data.table_name);
      }
    }

    return { created, table_error };
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
