import multer from "multer";
import { Request } from "express";

// Params for multer middleware
const storage = multer.memoryStorage();
const limits = {
  fileSize: process.env.MAX_UPLOAD_SIZE
    ? +process.env.MAX_UPLOAD_SIZE * 1000000
    : 15 * 1000000, // 100MB
};

export type UploadedFileType = Express.Multer.File;

function commonFiles(req: Request, file: UploadedFileType, callback: any) {
  try {
    const fileFormat = [
      "image/gif",
      "image/jpeg",
      "image/png",
      "image/jpg",
      "text/csv",
      "text/html",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.ms-excel.addin.macroEnabled.12",
      "application/vnd.ms-excel.sheet.macroEnabled.12",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/pdf",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.ms-access",
      "application/json",
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.ms-excel.addin.macroEnabled.12",
      "application/vnd.ms-excel.sheet.macroEnabled.12",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (fileFormat.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(null, false);
      callback(
        new Error("Please ensure you are uploading 1 image (jpeg or png).")
      );
    }
  } catch (error) {
    callback(
      new Error("Something went wrong processing this file. Code: FL000004")
    );
  }
}

function htmlFile(req: Request, file: UploadedFileType, callback: any) {
  try {
    const fileFormat = ["text/html"];
    if (fileFormat.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(null, false);
      callback(new Error("Please ensure you are uploading 1 html file."));
    }
  } catch (error) {
    callback(
      new Error("Something went wrong processing this file. Code: FL000005")
    );
  }
}

// Multer Middleware
export const files = multer({
  limits,
  storage,
  fileFilter: commonFiles,
}).fields([{ name: "files", maxCount: 5 }]);

export const html = multer({
  limits,
  storage,
  fileFilter: htmlFile,
}).fields([{ name: "html", maxCount: 1 }]);
