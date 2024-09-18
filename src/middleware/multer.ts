import multer from "multer";
import { Request } from "express";

// Params for multer middleware
const storage = multer.memoryStorage();
const limits = {
  fileSize: 100000000, // 100MB
};

export type UploadedFileType = Express.Multer.File;

const imageFileTypes = (
  req: Request,
  file: UploadedFileType,
  callback: any
) => {
  try {
    const fileFormat = ["image/jpeg", "image/png", "image/jpg"];
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
      new Error("Something went wrong processing this file. Code: FL000001")
    );
  }
};

const documentFileType = (req: any, file: UploadedFileType, callback: any) => {
  try {
    const fileFormat = [
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
      "image/jpeg",
      "image/png",
      "image/jpg",
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
      new Error("Something went wrong processing this file. Code: FL000002")
    );
  }
};

const jsonFileType = (req: Request, file: UploadedFileType, callback: any) => {
  try {
    const fileFormat = ["application/json"];
    if (fileFormat.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(null, false);
      callback(new Error("Please ensure you are uploading 1 JSON file."));
    }
  } catch (error) {
    callback(
      new Error("Something went wrong processing this file. Code: FL000003")
    );
  }
};

const excelOnly = (req: Request, file: UploadedFileType, callback: any) => {
  try {
    const fileFormat = [
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
};

// Multer Middleware

/**Use to Accept Form data with no file => file<UploadedFileType> */
export const multer_text = multer({
  limits,
  storage,
}).none();

/**Avoid using this as it allows any and all => files<UploadedFileType[]> */
export const multer_any = multer({
  limits,
  storage,
}).any();

/**Single Image => file<UploadedFileType>*/
export const multer_single_image = multer({
  limits,
  storage,
  fileFilter: imageFileTypes,
}).single("singleImage");
/**Accept multiple images you can set the limit, default: 20 => files<UploadedFileType[]>*/
export const multer_multi_image = multer({
  limits,
  storage,
  fileFilter: imageFileTypes,
}).fields([{ name: "multiImage", maxCount: 20 }]);
/**Accept multiple document types at once, default: 20 => files<UploadedFileType[]>*/
export const multer_multi_file = multer({
  limits,
  storage,
  fileFilter: documentFileType,
}).fields([{ name: "multiDocuments", maxCount: 10 }]);
/**Accept only a single document=> file<UploadedFileType>*/
export const multer_single_files = multer({
  limits,
  storage,
  fileFilter: documentFileType,
}).single("singleDocument");
/**Accept multiple JSON files default: 1 => files<UploadedFileType[]>*/
export const multer_json_files = multer({
  limits,
  storage,
  fileFilter: jsonFileType,
}).fields([{ name: "jsonFile", maxCount: 1 }]);
/**Accept a single excel or csv file => file<UploadedFileType>*/
export const multer_excel = multer({
  limits,
  storage,
  fileFilter: excelOnly,
}).single("excel");
