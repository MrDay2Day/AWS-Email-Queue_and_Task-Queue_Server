import { NextFunction, Request, Response } from "express";
import { connect_sql } from "../../../config/mysql/config";
import { QueryResult } from "mysql2";
import { APIKeyTypes } from "../../models/database/types/General_Types";

export enum API_KEY_TYPE {
  ADMIN = "ADMIN",
  USER = "USER",
  NULL = "",
}

declare global {
  namespace Express {
    interface Request {
      api_key: string;
      api_key_type: API_KEY_TYPE;
      allowed_api: string;
    }
  }
}

const ADMIN_API_KEY = process.env.ADMIN_API_KEY
  ? process.env.ADMIN_API_KEY
  : "";

type SelectEmailDataTypes = QueryResult & [APIKeyTypes];

export async function auth(
  req: Request,
  res: Response,
  nex: NextFunction
): Promise<any> {
  try {
    const notAuth = (msg: string, num: number) => {
      throw { msg, code: `AUT00${num}` };
    };

    req.api_key = "";
    req.api_key_type = API_KEY_TYPE.NULL;
    req.allowed_api = "";

    const authHeader = req.get("Authorization") as string;
    if (!authHeader) {
      notAuth("Invalid Headers", 1001);
    }

    const tempt = authHeader.split(" ");
    const api_token = tempt[tempt.length - 1];

    if (api_token === ADMIN_API_KEY) {
      req.api_key = api_token;
      req.api_key_type = API_KEY_TYPE.ADMIN;
      req.allowed_api = "*";
      return nex();
    }

    const sql = await connect_sql();
    const [fetched] = (await sql.query(
      `select * from api_key where api_key = ?`,
      [api_token]
    )) as SelectEmailDataTypes[];

    if (fetched.length < 1) {
      notAuth("Invalid API key", 1002);
    }
    const record_data: APIKeyTypes | null | undefined = fetched[0];

    if (record_data.temporary) {
      if (record_data.expire_date) {
        if (record_data.expire_date < new Date()) {
          notAuth("API Key has expired.", 102003);
        }
      } else {
        notAuth("Invalid API Key.", 102004);
      }
    }

    console.log({ record_data });

    req.api_key = record_data.api_key as string;
    req.api_key_type = API_KEY_TYPE.USER;
    req.allowed_api = record_data.return_api as string;

    return nex();
  } catch (error: any) {
    console.log({ error });
    return res.status(401).json({
      msg: error.msg || "Something went wrong.",
      valid: false,
      code: error.code || "AUT00000000",
    });
  }
}
