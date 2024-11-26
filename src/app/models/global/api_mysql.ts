// Object-Oriented approach with MongoDB Documents.

import { v4 as uuidv4 } from "uuid";

import { QueryResult } from "mysql2";
import { connect_sql, sql } from "../../../config/mysql/config";
import { APIKeyTypes } from "../database/types/General_Types";
import { Connection } from "mysql2/promise";

type SelectEmailDataTypes = QueryResult & [APIKeyTypes];

// let sql: Connection | null;

// (async function () {
//   try {
//     sql = await connect_sql();
//   } catch (error) {
//     // throw error;
//   }
// })();

export class APIClassSQLClass implements APIKeyTypes {
  id: string;
  api_key: string;
  api_name: string;
  return_api: string;
  temporary: Boolean;
  expire_date: Date;
  created_at: Date;

  constructor() {
    this.id = "";
    this.api_key = "";
    this.api_name = "";
    this.return_api = "";
    this.temporary = false;
    this.expire_date = new Date();
    this.created_at = new Date();
  }

  async newAPIKey(record: {
    api_key: string;
    api_name: string;
    return_api: string;
    temporary: Boolean;
    expire_date: Date;
  }) {
    try {
      const [info] = (await sql?.query(
        `insert into api_key(api_key, api_name, return_api, temporary, expire_date) values(?, ?, ?, ?, ?)`,
        [
          record.api_key,
          record.api_name,
          record.return_api,
          record.temporary,
          record.expire_date,
        ]
      )) as { insertId: number }[];

      const insertedId = info.insertId;

      const [fetched] = (await sql?.query(
        `select * from api_key where id = ?`,
        [insertedId]
      )) as SelectEmailDataTypes[];

      const record_data: APIKeyTypes | null | undefined = fetched[0];

      if (Object.keys(record_data).length <= 0) {
        throw new Error("Something went wrong");
      }

      this.id = record_data.id;
      this.api_key = record_data.api_key;
      this.api_name = record_data.api_name;
      this.return_api = record_data.return_api;
      this.temporary = record_data.temporary;
      this.expire_date = record_data.expire_date;
      this.created_at = record_data.created_at;
    } catch (err) {
      throw err;
    }
  }

  async deleteAPIKey(param: {
    user_key: string;
    api_key_to_delete?: string;
    api_name?: string;
  }) {
    try {
      if ((!param.api_key_to_delete && !param.api_name) || !param.user_key) {
        throw {
          msg: "Missing fields, Required (user_key: string AND (api_key: string OR api_name: string)).",
          code: 9638101,
        };
      }
      if (param.api_key_to_delete) {
        await sql?.query(`DELETE FROM api_key WHERE api_key = ?`, [
          param.api_key_to_delete,
        ]);
        return true;
      }
      if (param.api_name) {
        await sql?.query(`DELETE FROM api_key WHERE api_name = ?`, [
          param.api_name,
        ]);
        return true;
      }

      throw {
        msg: "There was some issue with removing this API key.",
        code: 645219,
      };
    } catch (error) {
      throw error;
    }
  }

  returnData() {
    return {
      id: this.id,
      api_key: this.api_key,
      api_name: this.api_name,
      return_api: this.return_api,
      temporary: this.temporary,
      expire_date: this.expire_date,
      created_at: this.created_at,
    };
  }
}
