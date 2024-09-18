import crypto from "crypto";

import sharp from "sharp";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

import { Buffer } from "buffer";

// @ts-ignore
import imagemin from "imagemin"; // Has no declaration file for this module
// @ts-ignore
import imageminJpegtran from "imagemin-jpegtran"; // Has no declaration file for this module
import imageminPngquant from "imagemin-pngquant";
import imageminJpegRecompress from "imagemin-jpeg-recompress";

import sizeOf from "buffer-image-size";

import B2 from "backblaze-b2";
import { Response } from "express";
import { checkJSONToData } from "../utils/helpers";

const max_thumbnail = 300;
const max_image = 1000;

const fileTypes = checkJSONToData<string[]>(
  process.env.FILE_TYPES || ""
) as string[];
const imagesOnly = checkJSONToData<string[]>(
  process.env.IMAGES_ONLY || ""
) as string[];

async function WriteFileToDB(x: any) {
  return x;
}

async function DeleteFileToDB(x: any) {
  return x;
}

const b2_private_credentials = {
  applicationKeyId: process.env.BACKBLAZE_PRIVATE_KEY_ID || "",
  applicationKey: process.env.BACKBLAZE_PRIVATE_KEY || "",
};
const b2_private =
  (process.env.ENABLE_FILE_UPLOAD || "") === "y"
    ? new B2(b2_private_credentials)
    : undefined;

async function GetBucket(): Promise<void> {
  try {
    if (b2_private && (process.env.ENABLE_FILE_UPLOAD || "") === "y") {
      await b2_private.authorize(); // must authorize first (authorization lasts 24 hrs)
      let response = await b2_private.getBucket({
        bucketName: process.env.BACKBLAZE_PRIVATE_BUCKET_NAME || "",
      });
    }
    return;
  } catch (err) {
    console.log("S3 Storage Error", err);
  }
}
GetBucket();

/**Refactor code for document such as .doc .pdf .xlsx etc and choose their respective folders.
 */
class Worker {
  static async addWatermark(imageBuffer: Buffer, watermarkText: string) {
    const image = sharp(imageBuffer);

    const { width, height } = await image.metadata();

    const svgOverlay = `
<svg width="${width || 0}" height="${height || 0}">
<text x="98%" y="98%" font-family="Verdana" font-weight="bold" font-size="20" fill="#e8e8e8" text-anchor="end" alignment-baseline="middle" opacity="0.7">${watermarkText}</text>
</svg>
    `;

    return image
      .composite([{ input: Buffer.from(svgOverlay), gravity: "center" }])
      .toBuffer();
  }
  static resizeImage = async (file: Buffer, size: number) => {
    return new Promise((resolve, reject) => {
      const dimensions = sizeOf(file);
      let height = null,
        width = null;

      if (dimensions.height > size || dimensions.width > size) {
        if (dimensions.height > dimensions.width) {
          height = size;
        } else {
          width = size;
        }
      } else {
        height = dimensions.height;
        width = dimensions.width;
      }

      sharp(file, { failOnError: false })
        .resize(width, height, {
          // width: size,
          // height: size,
          // failOnError: false,
          fit: "contain",
          position: "centre",
          kernel: sharp.kernel.mitchell,
          withoutEnlargement: false,
          // background: { r: 255, g: 255, b: 255, alpha: 0 },
        })
        .toBuffer()
        .then(async (buffer: Buffer) => {
          const file = (await imagemin.buffer(buffer, {
            plugins: [
              imageminJpegRecompress({
                accurate: true,
                method: "ssim",
                quality: "low",
                max: 70,
              }),
              imageminJpegtran({
                progressive: true,
              }),
              imageminPngquant({
                dithering: 1,
                strip: true,
                speed: 1,
                quality: [0.3, 0.3],
              }),
            ],
          })) as Buffer;

          resolve(file);
        })
        .catch((err: any) => {
          console.log("SHARP ERR", { err });
          reject(err);
        });
    });
  };

  static uploadNow = async (
    uploadUrl: any,
    uploadAuthorizationToken: any,
    image: any,
    location: any,
    file: any,
    fileName: string,
    extension: string
  ) => {
    try {
      const filePath = `${location}/${fileName}.${extension}`;
      var Sha1 = crypto.createHash("sha1").update(image).digest("hex");
      // console.log("UPLOAD", {
      //   uploadUrl,
      //   uploadAuthorizationToken,
      //   image,
      //   location,
      //   file,
      //   fileName,
      //   filePath,
      //   Sha1,
      // });
      const upload = await b2_private?.uploadFile({
        uploadUrl,
        uploadAuthToken: uploadAuthorizationToken,
        fileName: filePath,
        contentLength: file.size + 40,
        mime: file.mimetype,
        data: image,
        hash: Sha1,
        onUploadProgress: (event: any) => {},
      });
      return upload?.data;
    } catch (err) {
      throw err;
    }
  };

  static backblazeUpload = async (file: any, type: string, userId: string) => {
    // return;
    try {
      const response = await b2_private?.authorize();

      // console.log({ response });

      const data = response?.data;

      const uploadRequest = await b2_private?.getUploadUrl({
        bucketId: data.allowed.bucketId,
      });

      var uploadUrl = uploadRequest?.data.uploadUrl;
      var uploadAuthorizationToken = uploadRequest?.data.authorizationToken;
      var extension =
        file.originalname.split(".")[file.originalname.split(".").length - 1];
      var fileName = `${uuidv4()}-${Date.now()}`;
      var source = file.buffer;

      var location, resizedImage;

      if (!fileTypes.includes(type)) {
        throw { msg: "Invalid Request" };
      } else {
        location = type;
      }

      if (imagesOnly.includes(type)) {
        resizedImage = (await this.resizeImage(source, max_image)) as Buffer;
        resizedImage = await this.addWatermark(
          resizedImage,
          process.env.APP_NAME || ""
        );
      }

      let uploadRegularData = {};
      let uploadThumbnailData = {};

      uploadRegularData = await this.uploadNow(
        uploadUrl,
        uploadAuthorizationToken,
        imagesOnly.includes(type) ? resizedImage : source,
        location,
        file,
        fileName,
        extension
      );

      if (imagesOnly.includes(type)) {
        const thumbnail = await this.resizeImage(source, max_thumbnail);
        uploadThumbnailData = await this.uploadNow(
          uploadUrl,
          uploadAuthorizationToken,
          thumbnail,
          `${type}/thumbnail`,
          file,
          fileName,
          extension
        );
      }

      const uploadedFile =
        fileName.split("/")[fileName.split("/").length - 1] +
        "." +
        file.mimetype.split("/")[1];

      return {
        fileName: uploadedFile,
        userId,
        type,
        uploadRegularData,
        uploadThumbnailData,
      };
    } catch (err) {
      console.log({ err });
      throw err;
    }
  };
  /**
   *
   * DELETE FILE
   *
   */

  static backblazeDelete = async (
    fileName: string,
    fileId: string,
    type: string
  ) => {
    // return;
    try {
      const deleteRequest = await b2_private?.deleteFileVersion({
        fileId,
        fileName,
      });

      console.log({ deleteRequest: deleteRequest?.data });

      return { deleteRequest: deleteRequest?.data };
    } catch (err) {
      console.log({ err });
      throw err;
    }
  };
}

class FileManagement {
  static upload = async (type: string, userId: string, file: any) => {
    type backUpInfo = null | { [key: string]: string | number };
    var backUpInfo = {};
    try {
      if (!fileTypes.includes(type)) {
        throw { msg: "Invalid entry for file." };
      }

      console.log({ file });

      const fileData = await Worker.backblazeUpload(file, type, userId);

      backUpInfo = fileData;

      const savedFile = await WriteFileToDB({
        ...fileData,
        type,
        _id: uuidv4() + "-" + Date.now(),
      });

      return savedFile;
    } catch (err) {
      console.log({ backUpInfo });
      this.delete(backUpInfo);
      console.log({ err });
      throw { err };
    }
  };

  static delete = async (fileData: null | { [key: string]: any }) => {
    try {
      const result = [];

      console.log({ fileData });

      if (fileData) {
        if (fileData.uploadRegularData) {
          const res_regular = await Worker.backblazeDelete(
            fileData.uploadRegularData.fileName,
            fileData.uploadRegularData.fileId,
            fileData.type
          );
          result.push({ regular: res_regular });
        }

        if (fileData.uploadThumbnailData) {
          const res_thumbnail = await Worker.backblazeDelete(
            fileData.uploadThumbnailData.fileName,
            fileData.uploadThumbnailData.fileId,
            fileData.type
          );
          result.push({ thumbnail: res_thumbnail });
        }
      }

      console.log({ result });

      return result;
    } catch (err) {
      console.log({ err });
      throw { err };
    }
  };

  static findAndDelete = async (fileName: string) => {
    try {
      let fileData = await DeleteFileToDB(fileName);

      const result = await this.delete(fileData);

      console.log({ deletedFileData: result });

      return result;
    } catch (err) {
      console.log({ err });
      return { err };
    }
  };

  static async fetchFile({
    contentType,
    fileName,
    res,
  }: {
    contentType: string;
    fileName: string;
    res: Response;
  }) {
    try {
      if (!process.env.FILE_UP_DOWN) {
        throw { msg: "File fetch disabled.", code: "BB0000001" };
      }

      var fileToSend = await b2_private?.downloadFileByName({
        bucketName: process.env.BACKBLAZE_PRIVATE_BUCKET_NAME || "",
        fileName,
        // options are as in axios: 'arraybuffer', 'blob', 'document', 'json', 'text', 'stream'
        responseType: "arraybuffer",
      });

      res
        .status(200)
        .setHeader("Content-Type", contentType)
        .send(fileToSend?.data);
    } catch (err: any | unknown) {
      res.status(400).json({
        valid: false,
        err: {
          msg: err.msg || "Something went wrong, please try again.",
          Code: err.code || "BB0000003",
        },
      });
    }
  }
}

export default FileManagement;
