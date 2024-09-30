import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { connect_sql } from "../../config/mysql/config";
import { QueryResult } from "mysql2/promise";
import LineQueue from "../engines/lineQueueEngine";
import EmailEngine, {
  AttachmentType,
  AWSEmailType,
} from "../engines/emailEngine";
import { EmailClassSQL } from "../models/global/email_mysql";
import { EmailDataTypes } from "../models/database/types/General_Types";
import { checkJSONToData, generateString } from "../utils/helpers";
import { API_KEY_TYPE } from "../routers/utils/auth";
import { Buffer } from "buffer";
import ReturnAPIController from "./ReturnAPIController";

type EmailDataReturnType = AWSEmailType & {
  return_api: string;
  api_key: string;
};

const aws_wait_period = process.env.AWS_SES_QUEUE_WAIT_TIME
  ? +process.env.AWS_SES_QUEUE_WAIT_TIME
  : 1000;
const rate_limit = process.env.AWS_SES_SEND_LIMIT_PER_SEC
  ? +process.env.AWS_SES_SEND_LIMIT_PER_SEC
  : 10;

async function main_function(data: EmailDataReturnType): Promise<void> {
  try {
    const result = await EmailEngine.AWS_SEND(data);
    console.log({ data, result });

    const res = await ReturnAPIController.post_return(
      data.api_key,
      data.return_api,
      {
        email_id: data.id,
        email_data: {
          email: data.email,
          replyEmail: data.replyEmail,
          sendEmail: data.sendEmail,
          shortName: data.shortName,
          subject: data.subject,
          text: data.text,
          data: data.data,
          emailAttachments: data.emailAttachments,
          template: data.template,
        },
      }
    );

    console.log({ res });
    // send result to return_api
  } catch (error) {
    console.log({ error });
  }
}
const emailQueue = new LineQueue<EmailDataReturnType, void>(
  aws_wait_period,
  rate_limit,
  main_function
);

const g = generateString;

class EmailController {
  static async addToQueue(
    req: Request,
    res: Response,
    nex: NextFunction
  ): Promise<any> {
    try {
      if (req.api_key_type !== API_KEY_TYPE.USER) {
        throw { msg: "Not Authorized!", status: 401, code: "6341192" };
      }
      // Validate Email Queue request
      const { body, files, api_key, allowed_api } = req;
      let {
        email,
        shortName,
        replyEmail,
        sendEmail,
        subject,
        data,
        text,
        template,
      } = body;
      if (!email || !replyEmail || !sendEmail || !subject) {
        throw {
          msg: "Missing Field: - Required {id: string, email: string, replyEmail: string, sendEmail: string, subject: string, data: JSON, template: string}. Optional: - Attachments: {buffer: Buffer, mimeType: string} FormData field name = 'files' maximum of 5 attached files not exceeding 25MB.",
          code: "60021",
        };
      }

      if (!template && !text) {
        throw {
          msg: "Missing Field: - Required {template: string || text: string}.",
          code: "60022",
        };
      }

      const parsed_data = data
        ? checkJSONToData<{ [key: string]: any }>(data)
        : null;
      if (parsed_data) {
        data = parsed_data;
      }

      const emailAttachments: AttachmentType[] = [];
      const attachment_errors: {
        fileName: string;
        error: string;
        data: Express.Multer.File;
      }[] = [];

      const uploaded_files: Express.Multer.File[] = Array.isArray(files)
        ? files
        : typeof files === "object" && files !== undefined && "files" in files
        ? (files["files"] as Express.Multer.File[])
        : [];

      if (
        uploaded_files &&
        typeof uploaded_files !== undefined &&
        uploaded_files.length > 0
      ) {
        uploaded_files.forEach((file, file_index) => {
          const file_data: AttachmentType = {};
          if (file.buffer && file.mimetype) {
            // Buffer
            file_data.buffer = file.buffer;
            // File name
            if (file.originalname) {
              file_data.fileName = file.originalname;
            } else {
              file_data.fileName = `attachment_${file_index + 1}`;
            }
            // Extension
            const extension_array = file.mimetype.split("/");
            file_data.extension = extension_array[1];
            // mimetype
            file_data.mimetype = file.mimetype;

            emailAttachments.push(file_data);
          } else {
            attachment_errors.push({
              data: file,
              fileName: file.originalname ? file.originalname : "unknown files",
              error: "Missing file buffer.",
            });
          }
        });
      }

      const queue_id = `${g(20)}-${g(6)}-${g(12)}`;
      const data_to_process = {
        id: queue_id,
        return_api: allowed_api,
        email,
        shortName: shortName || sendEmail,
        replyEmail,
        sendEmail,
        subject,
        text,
        data: parsed_data,
        template,
        emailAttachments,
        api_key,
      } as EmailDataReturnType;

      emailQueue.add(data_to_process);

      return res.status(200).json({
        queue_id,
        valid: true,
      });
    } catch (error: any) {
      return res.status(error.status || 200).json({
        msg: error.msg || error.sqlMessage || "Something went wrong.",
        valid: false,
        code: `EML001_${error.code || "00001"}`,
      });
    }
  }
}

export default EmailController;
