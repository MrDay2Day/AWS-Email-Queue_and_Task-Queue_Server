import { NextFunction, Request, Response } from "express";

import EmailEngine, {
  AttachmentType,
  AWSEmailType,
} from "../engines/emailEngine";
import { checkJSONToData, generateString } from "../utils/helpers";
import { API_KEY_TYPE } from "../routers/utils/auth";
import { Buffer } from "buffer";
import ReturnAPIController from "./ReturnAPIController";

import * as path from "path";
import * as fs from "fs/promises";
import { EmailClassSQL } from "../models/global/email_mysql";
import {
  EMAIL_STATUS,
  EMAIL_TYPE,
} from "../models/database/types/General_Types";
import { catchErrorPromise } from "../utils/catchError";
import { EmailLineQueue } from "../engines/lineQueueEngine";

export type EmailDataReturnType = AWSEmailType & {
  return_api: string;
  api_key: string;
  attachments: number;
};

const aws_wait_period = process.env.AWS_SES_QUEUE_WAIT_TIME
  ? +process.env.AWS_SES_QUEUE_WAIT_TIME
  : 1000;
const rate_limit = process.env.AWS_SES_SEND_LIMIT_PER_SEC
  ? +process.env.AWS_SES_SEND_LIMIT_PER_SEC
  : 10;

async function main_function(data: EmailDataReturnType): Promise<void> {
  try {
    let STATUS: string = process.env.TEST ? "SIMULATED" : "QUEUE";
    const email_record = new EmailClassSQL();
    await email_record.newRecord({
      id: data.id,
      data: JSON.stringify(data.data),
      message_id: null,
      email: data.email,
      send_email: data.sendEmail,
      subject: data.subject,
      return_api: data.return_api,
      attachments: data.attachments,
      api_key: data.api_key,
      type: data.type,
    });

    try {
      const { valid, info, err } = await EmailEngine.AWS_SEND(data);

      if (err || !valid) {
        console.log({ err });
        await email_record.updateStatusById({
          id: data.id,
          status: EMAIL_STATUS.FAIL,
        });
      }

      if (info) {
        const updated = await email_record.updateMessageIdById({
          id: data.id,
          message_id: info.response,
        });

        await email_record.updateStatusById({
          id: data.id,
          status: EMAIL_STATUS.PENDING,
        });

        await ReturnAPIController.post_return(data.api_key, data.return_api, {
          status: STATUS,
          email_id: data.id,
          type: data.type,
          data: {
            email_data: {
              email: email_record.email,
              send_email: email_record.send_email,
              subject: email_record.subject,
              data: email_record.data,
              open: !!email_record.open,
            },
            aws_info: info,
            error: err,
          },
        });
      }
    } catch (error) {
      await email_record.updateStatusById({
        id: data.id,
        status: EMAIL_STATUS.FAIL,
      });
      throw error;
    }
  } catch (error) {
    await catchErrorPromise(
      ReturnAPIController.post_return(data.api_key, data.return_api, {
        status: "ERROR",
        email_id: data.id,
        data: {
          email_data: {
            email: data.email,
            send_email: data.sendEmail,
            subject: data.subject,
            data: data.data,
            open: false,
          },
          error,
        },
      })
    );
  }
}
const emailQueue = new EmailLineQueue<void>(
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
        type,
        template,
      } = body;
      if (!email || !replyEmail || !sendEmail || !subject || !type) {
        throw {
          msg: "Missing Field: - Required {shortName: string, email: string, replyEmail: string, sendEmail: string, subject: string, data: JSON, type: string template: string}. Optional: - Attachments: {buffer: Buffer, mimeType: string} FormData field name = 'files' maximum of 5 attached files not exceeding 25MB.",
          code: "60021",
        };
      }

      if (!Object.values(EMAIL_TYPE).includes(type)) {
        throw {
          msg: `Invalid email type, Email type should be either${Object.values(
            EMAIL_TYPE
          ).map((e) => ` ${e}`)}`,
          code: "60076",
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
              file_data.fileName = file.originalname.split(".")[0];
            } else {
              file_data.fileName = `attachment_${file_index + 1}`;
            }
            // Extension
            const extension_array = file.mimetype.split("/");
            file_data.extension = extension_array[1];
            // mimetype
            file_data.mimetype = file.mimetype;
            // Add to attachment array for email
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
        type,
        data: parsed_data,
        template,
        emailAttachments,
        attachments: emailAttachments.length,
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
        code: `EML001_${error.code || "004120"}`,
      });
    }
  }

  static async fetchEmailsRecords(
    req: Request,
    res: Response,
    nex: NextFunction
  ): Promise<any> {
    try {
      if (req.api_key_type !== API_KEY_TYPE.USER) {
        throw { msg: "Not Authorized!", status: 401, code: "4000622" };
      }

      const { api_key, body } = req;
      let { page, amount } = body as { page: number; amount: number };

      if (!page || !amount || page < 1 || amount < 10 || amount > 50) {
        throw { msg: "Invalid entries", code: "500321" };
      }

      const email_record = new EmailClassSQL();
      const raw_results = await email_record.fetchInfoByApiKey(
        api_key,
        amount < 10 || amount > 50 ? 10 : amount,
        page < 1 ? 1 : page
      );

      const result_to_send: any = [];

      raw_results?.forEach((result) => {
        result_to_send.push({
          email_id: result.id,
          email: result.email,
          send_email: result.send_email,
          subject: result.subject,
          data: result.data,
          open: !!result.open,
          status: result.status,
          type: result.type,
          aws_message_id: result.message_id,
          created_at: result.created_at,
          updated_at: result.updated_at,
          attachments: result.attachments,
          api_key: `${result.api_key.split("-")[0]}-xxxxxxxxxxxx_xxxxxxxx.${
            result.api_key.split(".")[1]
          }`,
        });
      });

      return res.status(200).json({ valid: true, result: result_to_send });
    } catch (error: any) {
      return res.status(error.status || 200).json({
        msg: error.msg || error.sqlMessage || "Something went wrong.",
        valid: false,
        code: `EML001_${error.code || "6011231"}`,
      });
    }
  }

  static async fetchSpecificEmails(
    req: Request,
    res: Response,
    nex: NextFunction
  ): Promise<any> {
    try {
      if (req.api_key_type !== API_KEY_TYPE.USER) {
        throw { msg: "Not Authorized!", status: 401, code: "4000501" };
      }

      const { api_key, body } = req;
      const { email_ids } = body;

      const ids_to_find: string[] = [];

      if (
        !email_ids ||
        !Array.isArray(email_ids) ||
        email_ids.length < 1 ||
        email_ids.length > 30
      ) {
        throw { msg: "Invalid entries", code: "500211" };
      }

      email_ids.forEach((id) => {
        if (!ids_to_find.includes(id)) {
          if (typeof id === "string") {
            ids_to_find.push(id);
          }
        }
      });

      if (ids_to_find.length < 1) {
        throw { msg: "No 'email_id' found.", code: "500212" };
      }

      const result: any[] = [];

      for (let the_id in ids_to_find) {
        const email_record = new EmailClassSQL();
        await email_record.fetchInfo({ id: ids_to_find[the_id], api_key });
        if (email_record.id) {
          result.push({
            email_id: email_record.returnData().id,
            email: email_record.returnData().email,
            send_email: email_record.returnData().send_email,
            subject: email_record.returnData().subject,
            data: email_record.returnData().data,
            open: !!email_record.returnData().open,
            status: email_record.returnData().status,
            type: email_record.returnData().type,
            aws_message_id: email_record.returnData().message_id,
            created_at: email_record.returnData().created_at,
            updated_at: email_record.returnData().updated_at,
            attachments: email_record.returnData().attachments,
            api_key: `${
              email_record.returnData().api_key.split("-")[0]
            }-xxxxxxxxxxxx_xxxxxxxx.${
              email_record.returnData().api_key.split(".")[1]
            }`,
          });
        }
      }

      return res.status(200).json({ valid: true, result });
    } catch (error: any) {
      return res.status(error.status || 200).json({
        msg: error.msg || error.sqlMessage || "Something went wrong.",
        valid: false,
        code: `EML001_${error.code || "6011230"}`,
      });
    }
  }

  static async addTemplate(
    req: Request,
    res: Response,
    nex: NextFunction
  ): Promise<any> {
    try {
      if (req.api_key_type !== API_KEY_TYPE.ADMIN) {
        throw { msg: "Not Authorized!", status: 401, code: "6341165" };
      }

      const { files } = req;

      const uploaded_files: Express.Multer.File[] = Array.isArray(files)
        ? files
        : typeof files === "object" && files !== undefined && "html" in files
        ? (files["html"] as Express.Multer.File[])
        : [];

      if (uploaded_files.length > 0) {
        const file = uploaded_files[0];
        await Helper.writeFileToDirectory(file.buffer, file.originalname);
      } else {
        throw { msg: "Missing .html file.", code: "400450" };
      }

      return res.status(200).json({ valid: true });
    } catch (error: any) {
      return res.status(error.status || 200).json({
        msg: error.msg || error.sqlMessage || "Something went wrong.",
        valid: false,
        code: `EML001_${error.code || "056028"}`,
      });
    }
  }

  static async listTemplates(
    req: Request,
    res: Response,
    nex: NextFunction
  ): Promise<any> {
    try {
      if (req.api_key_type !== API_KEY_TYPE.ADMIN) {
        throw { msg: "Not Authorized!", status: 401, code: "6341177" };
      }

      const { body } = req;
      const { page, limit } = body as { page: number; limit: number };

      const directory_files = await Helper.listFilesInDirectory(
        page || 0,
        limit ? (limit > 20 || limit < 5 ? 5 : limit) : 5
      );

      return res.status(200).json({ valid: true, ...directory_files });
    } catch (error: any) {
      return res.status(error.status || 200).json({
        msg: error.msg || error.sqlMessage || "Something went wrong.",
        valid: false,
        code: `EML001_${error.code || "00003"}`,
      });
    }
  }

  static async removeTemplate(
    req: Request,
    res: Response,
    nex: NextFunction
  ): Promise<any> {
    try {
      if (req.api_key_type !== API_KEY_TYPE.ADMIN) {
        throw { msg: "Not Authorized!", status: 401, code: "6341176" };
      }

      const { body } = req;
      const { fileName } = body as { fileName: string };

      if (!fileName) {
        throw { msg: "Missing field: {fileName: string}", code: "400771" };
      }

      await Helper.deleteFileFromDirectory(fileName);

      return res.status(200).json({ valid: true });
    } catch (error: any) {
      return res.status(error.status || 200).json({
        msg: error.msg || error.sqlMessage || "Something went wrong.",
        valid: false,
        code: `EML001_${error.code || "000034"}`,
      });
    }
  }
}

class Helper {
  static async writeFileToDirectory(fileBuffer: Buffer, fileName: string) {
    try {
      if (!fileName.endsWith(".html")) {
        throw new Error("Invalid file type. Only .html files are allowed.");
      }

      const filePath = path.join(
        path.resolve(__dirname, "..", "..", "..", "emails"),
        fileName
      );

      const uint8ArrayBuffer = new Uint8Array(fileBuffer);

      await fs.writeFile(filePath, uint8ArrayBuffer);
      return true;
    } catch (error) {
      console.error("Error writing file:", error);
      throw { msg: error, code: "400020" };
    }
  }

  static async listFilesInDirectory(page: number, limit: number) {
    try {
      await fs.mkdir(path.resolve(__dirname, "..", "..", "..", "emails"), {
        recursive: true,
      });
      const files = await fs.readdir(
        path.resolve(__dirname, "..", "..", "..", "emails")
      );

      const fileList = (
        await Promise.all(
          files.map(async (file) => {
            const fullPath = path.join(
              path.resolve(__dirname, "..", "..", "..", "emails"),
              file
            );
            const stat = await fs.stat(fullPath);
            return stat.isFile() && file.endsWith(".html") ? file : null;
          })
        )
      ).filter(Boolean); // Filter out any null values

      return {
        templates: fileList.slice((page - 1) * limit, limit * page),
        count: fileList.length,
        total_pages: Math.ceil(fileList.length / limit),
      };
    } catch (error) {
      console.error("Error reading directory:", error);
      throw { msg: error, code: "400021" };
    }
  }

  static async deleteFileFromDirectory(fileName: string) {
    try {
      const filePath = path.join(
        path.resolve(__dirname, "..", "..", "..", "emails"),
        fileName
      );

      await fs.unlink(filePath);
      return true;
    } catch (error: any) {
      console.error("Error deleting file:", error);
      throw {
        msg: error.code
          ? error.code === "ENOENT"
            ? "File does not exist"
            : error
          : error,
        code: "400022",
      };
    }
  }
}

export default EmailController;
