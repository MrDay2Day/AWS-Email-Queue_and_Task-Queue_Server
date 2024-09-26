// Object-Oriented approach with MongoDB Documents.

import { v4 as uuidv4 } from "uuid";

import { QueryResult } from "mysql2";
import { connect_sql } from "../../../config/mysql/config";
import { EmailDataTypes } from "../database/types/General_Types";

type SelectEmailDataTypes = QueryResult & [EmailDataTypes];

export class EmailClassSQL implements EmailDataTypes {
  id: string | null;
  data: string | null;
  return_api: string | null;
  sent: Boolean | null;
  updated_at: Date | null;
  created_at: Date | null;
  constructor() {
    this.id = null;
    this.data = null;
    this.return_api = null;
    this.sent = null;
    this.updated_at = null;
    this.created_at = null;
    // this.init();
    // this.printOut();
  }

  async newRecord(record: { data: string; return_api: string }) {
    const sql = await connect_sql();
    try {
      const [info] = (await sql.query(
        `insert into email(data, return_api, sent) values(?, ?, ?)`,
        [record.data, record.return_api, false]
      )) as { insertId: number }[];

      const insertedId = info.insertId;

      const [fetched] = (await sql.query(`select * from email where id = ?`, [
        insertedId,
      ])) as SelectEmailDataTypes[];

      const record_data: EmailDataTypes | null | undefined = fetched[0];

      if (record_data) {
        this.id = record_data.id;
        this.data = record_data.data;
        this.return_api = record_data.return_api;
        this.sent = record_data.sent;
        this.updated_at = record_data.updated_at;
        this.created_at = record_data.created_at;
      }
    } catch (err) {
      throw err;
    } finally {
      sql.end();
    }
  }

  returnData() {
    return {
      id: this.id,
      data: this.data,
      return_api: this.return_api,
      sent: this.sent,
      updated_at: this.updated_at,
      created_at: this.created_at,
    };
  }
}
