import { Request, Response } from "express";
import { addTime, generateString as g } from "../utils/helpers";
import { APIClassSQLClass } from "../models/global/api_mysql";
import { API_KEY_TYPE } from "../routers/utils/auth";
import { verifyToken } from "../utils/jwt";

class APIController {
  static async addAPI(req: Request, res: Response): Promise<any> {
    try {
      if (req.api_key_type !== API_KEY_TYPE.ADMIN) {
        throw { msg: "Not Authorized!", status: 401, code: "6341192" };
      }
      const { body } = req;
      const { api_name, return_api, temporary, duration } = body as {
        api_name: string;
        return_api: string;
        temporary: Boolean;
        duration: string;
      };

      if (!api_name || !return_api || (temporary && !duration)) {
        throw {
          msg: "Missing fields, Requires: (api_name: string; return_api: string; temporary: Boolean; duration: string;)",
          code: "20023",
        };
      }

      const new_api_key = `${g(5)}-${g(12)}_${g(8)}.${g(20)}`;

      let newTime: Date | string;
      if (temporary) {
        newTime = addTime(duration);
      } else {
        newTime = addTime("10y");
      }

      console.log({ newTime });

      const newAPI = new APIClassSQLClass();
      await newAPI.newAPIKey({
        api_key: new_api_key,
        api_name,
        return_api,
        temporary,
        expire_date: new Date(newTime),
      });

      return res.status(200).json({
        api_name: newAPI.returnData().api_name,
        api_key: newAPI.returnData().api_key,
        return_api: newAPI.returnData().return_api,
        expire_date: newAPI.returnData().temporary
          ? newAPI.returnData().expire_date
          : null,
        valid: true,
      });
    } catch (error: any) {
      console.log({ error });
      return res.status(error.status || 200).json({
        msg: error.msg || error.sqlMessage || "Something went wrong.",
        valid: false,
        code: `API001_${error.code || "00001"}`,
      });
    }
  }

  static async deleteAPIKey(req: Request, res: Response): Promise<any> {
    try {
      if (req.api_key_type !== API_KEY_TYPE.ADMIN) {
        throw { msg: "Not Authorized!", status: 401, code: "6341192" };
      }
      const { body } = req;

      const { api_key, api_name } = body as {
        api_key?: string;
        api_name?: string;
      };

      if (!api_key && !api_name) {
        throw {
          msg: "Missing fields, Requires: (api_key: string; api_name: string; )",
          code: "259102",
        };
      }

      const newAPI = new APIClassSQLClass();
      await newAPI.deleteAPIKey({
        user_key: req.api_key,
        api_key_to_delete: api_key,
        api_name,
      });

      return res.status(200).json({
        valid: true,
      });
    } catch (error: any) {
      console.log({ error });
      return res.status(error.status || 200).json({
        msg:
          error.msg ||
          error.message ||
          error.sqlMessage ||
          "Something went wrong.",
        valid: false,
        code: `API064_${error.code || "00002"}`,
      });
    }
  }

  static async verify(req: Request, res: Response): Promise<any> {
    try {
      if (req.api_key_type !== API_KEY_TYPE.USER) {
        throw { msg: "Not Authorized!", status: 401, code: "6341192" };
      }

      const { token } = req.body as { token: string };
      if (!token) {
        throw { msg: "Invalid!", status: 400, code: "6341361" };
      }

      await verifyToken(token);

      res.status(200).json({ valid: true });
    } catch (error: any) {
      console.log({ error });
      return res.status(error.status || 200).json({
        msg: error.msg || error.message || "Something went wrong.",
        valid: false,
        code: `API065_${error.code || "00005"}`,
      });
    }
  }
}

export default APIController;
