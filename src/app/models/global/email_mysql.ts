// Object-Oriented approach with MongoDB Documents.

import { v4 as uuidv4 } from "uuid";

import { QueryResult } from "mysql2";
import { connect_sql, sql_pool } from "../../../config/mysql/config";
import { EMAIL_STATUS, EmailDataTypes } from "../database/types/General_Types";

type SelectEmailDataTypes = QueryResult & [EmailDataTypes];

export class EmailClassSQL implements EmailDataTypes {
  id: string;
  api_key: string;
  email: string;
  send_email: string;
  subject: string;
  message_id: string;
  data: string;
  return_api: string;
  attachments?: number;
  status: EMAIL_STATUS;
  open: Boolean;
  updated_at: Date;
  created_at: Date;
  constructor() {
    this.id = "";
    this.api_key = "";
    this.email = "";
    this.send_email = "";
    this.subject = "";
    this.message_id = "";
    this.data = "";
    this.return_api = "";
    this.attachments = 0;
    this.status = EMAIL_STATUS.PENDING;
    this.open = false;
    this.updated_at = new Date();
    this.created_at = new Date();
    // this.init();
    // this.printOut();
  }

  async newRecord(record: {
    id: string;
    data: string;
    message_id: string;
    email: string;
    send_email: string;
    subject: string;
    return_api: string;
    api_key: string;
    attachments: number;
  }) {
    const sql = await connect_sql();

    try {
      const [info] = (await sql.query(
        `insert into email(id, data, message_id, return_api, status, open, api_key, email, send_email, subject, attachments) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          record.id,
          record.data,
          record.message_id,
          record.return_api,
          EMAIL_STATUS.PENDING,
          false,
          record.api_key,
          record.email,
          record.send_email,
          record.subject,
          record.attachments,
        ]
      )) as { insertId: number }[];

      const insertedId = info.insertId;

      const [fetched] = (await sql.query(`select * from email where id = ?`, [
        insertedId,
      ])) as SelectEmailDataTypes[];

      const record_data: EmailDataTypes | null | undefined = fetched[0];

      if (record_data) {
        this.id = record_data.id;
        this.api_key = record_data.api_key;
        this.email = record_data.email;
        this.send_email = record_data.send_email;
        this.subject = record_data.subject;
        this.message_id = record_data.message_id;
        this.data = record_data.data;
        this.return_api = record_data.return_api;
        this.attachments = record_data.attachments;
        this.status = record_data.status;
        this.open = record_data.open;
        this.updated_at = record_data.updated_at;
        this.created_at = record_data.created_at;
      }

      return true;
    } catch (err) {
      throw err;
    } finally {
      sql.end();
    }
  }

  async updateRecord(record: { message_id: string; status: string }) {
    const sql = await connect_sql();

    try {
      await sql.query(`update email set status = ? where message_id = ?; `, [
        record.status,
        record.message_id,
      ]);

      const [fetched] = (await sql.query(
        `select * from email where message_id = ?`,
        [record.message_id]
      )) as SelectEmailDataTypes[];

      const record_data: EmailDataTypes | null | undefined = fetched[0];

      if (record_data) {
        this.id = record_data.id;
        this.api_key = record_data.api_key;
        this.email = record_data.email;
        this.send_email = record_data.send_email;
        this.subject = record_data.subject;
        this.message_id = record_data.message_id;
        this.data = record_data.data;
        this.return_api = record_data.return_api;
        this.attachments = record_data.attachments;
        this.status = record_data.status;
        this.open = record_data.open;
        this.updated_at = record_data.updated_at;
        this.created_at = record_data.created_at;
      }

      return true;
    } catch (err) {
      throw err;
    } finally {
      sql.end();
    }
  }

  async emailOpen() {
    const sql = await connect_sql();
    try {
      await sql.query(`update email set open = ? where message_id = ?;`, [
        true,
        this.message_id,
      ]);

      const [fetched] = (await sql.query(
        `select * from email where message_id = ?`,
        [this.message_id]
      )) as SelectEmailDataTypes[];

      const record_data: EmailDataTypes | null | undefined = fetched[0];

      if (record_data) {
        this.open = record_data.open;
      }

      return true;
    } catch (err) {
      throw err;
    } finally {
      sql.end();
    }
  }

  async fetchInfo(record: {
    message_id?: string;
    id?: string;
    api_key?: string;
  }) {
    const sql = await connect_sql();

    console.log({ id: record.id, api_key: record.api_key });

    try {
      if (!record.id && !record.message_id) {
        throw { msg: "Missing field for search" };
      }

      let column: string = "";
      let value: string = "";

      if (record.message_id) {
        column = "message_id";
        value = record.message_id || "";
      } else if (record.id) {
        column = "id";
        value = record.id || "";
      }

      if (!column || !value) {
        throw new Error("No valid identifier provided (message_id or id).");
      }

      const sql_values = [value];
      if (record.api_key) {
        sql_values.push(record.api_key);
      }
      const [fetched] = (await sql.query(
        `SELECT * FROM email WHERE ${column} = ? ${
          record.api_key ? "AND api_key = ?" : ""
        };`,
        sql_values
      )) as SelectEmailDataTypes[];

      const record_data: EmailDataTypes | null | undefined = fetched[0];

      if (record_data) {
        this.id = record_data.id;
        this.api_key = record_data.api_key;
        this.email = record_data.email;
        this.send_email = record_data.send_email;
        this.subject = record_data.subject;
        this.message_id = record_data.message_id;
        this.data = record_data.data;
        this.return_api = record_data.return_api;
        this.attachments = record_data.attachments;
        this.status = record_data.status;
        this.open = record_data.open;
        this.updated_at = record_data.updated_at;
        this.created_at = record_data.created_at;
      }

      return true;
    } catch (err) {
      throw err;
    } finally {
      sql.end();
    }
  }

  async fetchInfoByApiKey(api_key: string, limit: number, offset: number) {
    const sql = await connect_sql();

    try {
      if (!api_key || !limit || !offset) {
        throw { msg: "Missing fields." };
      }

      const [fetched] = (await sql.query(
        `SELECT * FROM email WHERE api_key = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [api_key, limit, limit * (offset - 1)]
      )) as SelectEmailDataTypes[];

      const records: EmailDataTypes[] | null | undefined = fetched;

      return records;
    } catch (err) {
      throw err;
    } finally {
      sql.end();
    }
  }

  returnData() {
    return {
      status: this.status,
      id: this.id,
      api_key: this.api_key,
      email: this.email,
      send_email: this.send_email,
      subject: this.subject,
      message_id: this.message_id,
      data: this.data,
      return_api: this.return_api,
      attachments: this.attachments,
      open: this.open,
      updated_at: this.updated_at,
      created_at: this.created_at,
    };
  }
}
