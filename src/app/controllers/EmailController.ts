import { NextFunction, Request, Response } from "express";
import LineQueue from "../engines/lineQueueEngine";
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
    let STATUS: string = "SENT";
    const { valid, email_data, info, err } = await EmailEngine.AWS_SEND(data);
    console.log({ valid, email_data, info, err });
    if (err) {
      STATUS = "FAIL";
    }

    await ReturnAPIController.post_return(data.api_key, data.return_api, {
      status: STATUS,
      email_id: data.id,
      email_data: {
        email: data.email,
        replyEmail: data.replyEmail,
        sendEmail: data.sendEmail,
        shortName: data.shortName,
        subject: data.subject,
        template: data.template,
        data: data.data,
        htmlText: data.text,
        attachments: data.emailAttachments.length,
      },
      error: err,
    });
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
        code: `EML001_${error.code || "004120"}`,
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

      console.log({ fileBuffer, fileName });

      const filePath = path.join(
        path.resolve(__dirname, "..", "..", "..", "emails"),
        fileName
      );

      const uint8ArrayBuffer = new Uint8Array(fileBuffer);

      console.log({ uint8ArrayBuffer });
      await fs.writeFile(filePath, uint8ArrayBuffer);
      console.log(`File saved to ${filePath}`);
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
      console.log(`File ${fileName} deleted.`);
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
