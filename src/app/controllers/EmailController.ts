import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { connect_sql } from "../../config/mysql/config";
import { QueryResult } from "mysql2/promise";
import LineQueue from "../engines/lineQueueEngine";
import EmailEngine from "../engines/emailEngine";
import { EmailClassSQL } from "../models/global/email_mysql";
import { EmailDataTypes } from "../models/database/types/General_Types";
import { generateString } from "../utils/helpers";

function sendToAPI(): any {
  try {
  } catch (error) {
    console.log({ error });
  }
}

function triggerEmail(): any {
  try {
  } catch (error) {
    console.log({ error });
  }
}

const aws_wait_period = process.env.AWS_SES_QUEUE_WAIT_TIME
  ? +process.env.AWS_SES_QUEUE_WAIT_TIME
  : 1000;
const rate_limit = process.env.AWS_SES_SEND_LIMIT_PER_SEC
  ? +process.env.AWS_SES_SEND_LIMIT_PER_SEC
  : 10;
const emailQueue = new LineQueue<any, any>(
  aws_wait_period,
  rate_limit,
  EmailEngine.AWS_SEND
);

class EmailController {
  static async addToQueue(
    req: Request,
    res: Response,
    nex: NextFunction
  ): Promise<any> {
    try {
      // Validate request

      // Store request to database

      // Add request to in memory queue

      const email_record = new EmailClassSQL();
      await email_record.newRecord({ data: "hello", return_api: "world" });

      const g = generateString;
      const api_key = `${g(5)}-${g(12)}_${g(8)}.${g(20)}`;

      return res.status(200).json({
        api_key,
        record: email_record.returnData(),
        valid: true,
      });
    } catch (error) {
      console.log({ error });
      return res.status(200).json({ valid: false });
    }
  }
}

export default EmailController;
