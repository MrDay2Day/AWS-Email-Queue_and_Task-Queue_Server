import multer from "multer";
import { Request } from "express";

// Params for multer middleware
const storage = multer.memoryStorage();
const limits = {
  fileSize: process.env.MAX_UPLOAD_SIZE
    ? +process.env.MAX_UPLOAD_SIZE
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

// Multer Middleware
export const common_files = multer({
  limits,
  storage,
  fileFilter: commonFiles,
}).fields([{ name: "common_files", maxCount: 5 }]);
