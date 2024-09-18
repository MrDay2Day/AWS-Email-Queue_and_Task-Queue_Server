import pg, { PoolConfig } from "pg";
import {
  checkAndCreatePGDatabase,
  createPGTables,
} from "../../app/models/database/potsgres/trigger";
import { text_bright_yellow } from "../../utils/serverDataInfo";
import { isStringNumber } from "../../app/utils/helpers";
const { Pool } = pg;

export const pg_connection_data: PoolConfig = {
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  password: process.env.PG_PASS,
  port: isStringNumber(process.env.PG_PORT),
};

export const pg_connection_data_with_database: PoolConfig = {
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DB,
  password: process.env.PG_PASS,
  port: isStringNumber(process.env.PG_PORT),
};

export const pg_pool = async function (connection: PoolConfig) {
  const pg_conn = new Pool(connection);
  return await pg_conn.connect();
};

export const connect_pg = async function () {
  const pg_conn = new Pool(pg_connection_data_with_database);
  return await pg_conn.connect();
};

export const query_pg = async function (
  query: string,
  params: (string | number | boolean | Date)[]
) {
  const pg_conn = new Pool(pg_connection_data_with_database);
  return await pg_conn.query(query, params);
};

export function ConnectPostGres(): Promise<{
  valid: Boolean;
  [key: string]: any;
}> {
  console.log(text_bright_yellow("\tCONNECTING TO POSTGRES DATABASE..."));
  return new Promise(async function (resolve, reject) {
    try {
      await pg_pool(pg_connection_data);
      await checkAndCreatePGDatabase();
      await createPGTables();
      console.log(text_bright_yellow("\tPOSTGRES DATABASE CONNECTED!\n"));

      resolve({ valid: true });
    } catch (error) {
      console.log({ error });
      reject({ valid: false, error });
    }
  });
}
