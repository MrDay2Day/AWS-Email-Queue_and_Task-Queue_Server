import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
// This the validation results for or custom middleware validations
import { validationResult } from "express-validator";
import {
  DemoTypes,
  ErrorType,
  UserType,
} from "../models/database/types/Demo_Types";

import { faker } from "@faker-js/faker";

/**
 *
 *  To access database functionality
 *
 * */

// To Use PostGres Database
// Check NodeJS pg documentation
import { query_pg } from "../../config/postgres/config";

// To use MySQL Database
// Check mysql2/promise documentation
import { connect_sql } from "../../config/mysql/config";
import { QueryResult } from "mysql2/promise";

/**
 * To use MongoDB Database simply import Schema for collection from the 'models/database/mongodb/schemas**'
 *
 */
import Demo_User from "../models/database/mongo/schemas/Demo_User";

/**To use socket connection */
import { getIO } from "../../utils/socket";
/**
 *  Examples use of SocketIO websocket
...
const io = getIO();
io.to(<SOCKET_ID | SOCKET_ROOM>).emit("<listener>", data);
...
*/

// Handling multipart/form-data inside the controller
import { multer_single_image, UploadedFileType } from "../../middleware/multer";
import multer from "multer";
import FileManagement from "../apis/FileManagement";
// Sample Upload Data
import { demo_image_file, excel_file } from "./file_info";
import { DemoClassSQL } from "../models/global/demo_mysql";

function generate_user() {
  const demo_user = {
    _id: faker.string.uuid(),
    userId: faker.string.uuid(),
    username: faker.internet.userName(),
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    full_name: faker.person.fullName(),
    name: faker.person.fullName(),
    phone: parseInt(`1876${faker.string.numeric("#######")}`),
    email: faker.internet.email(),
    avatar: faker.image.avatar(),
    password: faker.internet.password(),
    dob: faker.date.birthdate(),
    registeredAt: faker.date.past(),
    userType: UserType.User,
    age: 0,
  };
  const user_dob_year = demo_user.dob.getFullYear();
  demo_user.age = new Date().getFullYear() - user_dob_year;
  return demo_user;
}

class DemoController {
  /**Demo handling post request */
  static async no_auth_demo(req: Request, res: Response, next: NextFunction) {
    try {
      const { number } = req.body as { number?: number };
      // number is already validated to exist from the middleware 'check_number' from 'route_auth'

      return res
        .status(200)
        .json({ valid: true, route: "no_auth_demo", number });
    } catch (error: ErrorType) {
      /**Recommendation: Sending status 200 -> OK which means the request was OK as it relates to your http request status.
       * On the client side the logic should look for the variable 'valid' and it's value 'true' or 'false'.
       * -> true if the request yielded the intended result.
       * -> false if the request did not yield the intended result.*/
      return res.status(200).json({
        valid: false,
        code: "DEMO000002",
        msg: error.msg || "Something went wrong.",
      });
    }
  }

  /**Demo handling get request */
  static async auth_demo(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.statusCode = 200;
        console.log(errors);
        return res.json({
          valid: false,
          error: {
            code: "VAL000001",
            msg: "Validation error",
            errors: errors.mapped(),
          },
        });
      }

      const { number, email } = req.body as { number: number; email: string };
      return res
        .status(200)
        .json({ valid: true, route: "auth_demo", req_body: { number, email } });
    } catch (error: ErrorType) {
      return res.status(200).json({ valid: false, code: "DEMO000001", error });
    }
  }

  /**Demo controller to handle file upload using multer before the controller */
  static async handle_file_1(req: Request, res: Response, next: NextFunction) {
    try {
      const { files, file } = req as {
        files: UploadedFileType[];
        file: UploadedFileType;
      };
      const { demo, name } = req.body as { demo: string; name: string };
      const { type } = req.params;

      console.log({ files, file, demo });

      const file_data = await FileManagement.upload(
        type, // "document" | "image" | (Optional: "profileImage")
        "1234567890abcdefg",
        file
      );

      // Uncomment to be able to return the file uploaded.
      // --
      // return await fetchFile({
      //   fileName: file_data.uploadRegularData.fileName,
      //   contentType: file_data.uploadRegularData.contentType,
      //   res,
      // });

      return res
        .status(200)
        .json({ valid: true, route: "handle_file", file_data, body: req.body });
    } catch (error: ErrorType) {
      return res.status(200).json({
        valid: false,
        code: "DEMO000003A",
        msg: error.msg || "Something went wrong.",
      });
    }
  }

  /**Here we use multer to handle multipart/form-data in the controller for a more custom experience, here we can deliver a custom error message or handle errors in another manor. */
  static async handle_file_2(req: Request, res: Response, next: NextFunction) {
    multer_single_image(req, res, async function (error) {
      try {
        if (error instanceof multer.MulterError) {
          console.log("Multer Error", { error });
          throw { error };
        } else if (error) {
          console.log("Unknown Error", { error });
          throw { error };
          // An unknown error occurred when uploading.
        }
        const { files, file } = req as {
          files: UploadedFileType[];
          file: UploadedFileType;
        };
        const { demo, name } = req.body as { demo: string; name: string };

        console.log({ files, file, demo, name });

        const file_data = await FileManagement.upload(
          "image", // "document" | "image" | (Optional: "profileImage")
          "1234567890abcdefg",
          file
        );

        return res
          .status(200)
          .json({ valid: true, route: "handle_file", file_data });
      } catch (error: ErrorType) {
        console.log("handle_file_2", { error });
        return res.status(200).json({
          valid: false,
          code: "DEMO000003B",
          msg: error.msg || "Something went wrong.",
        });
      }
    });
  }

  /**
  Demo of fetching a file securely and serving to frontend from Backblaze S3 whether it an image or file.
  */
  static async fetch_file(req: Request, res: Response, next: NextFunction) {
    try {
      /**When you need to pass a forward slash (`/`) in a URL as part of a string, you should encode it to ensure it is correctly interpreted as part of the query string or path parameter. The encoded value for a forward slash is `%2F`. 
       * 
       * Example: 
            const myString = 'hello/world';
            const encodedString = encodeURIComponent(myString);
            const url = `https://example.com/path?param=${encodedString}`;

            const decodedString = decodeURIComponent(encodedString); // -> 'hello/world'
       * 
       * 
      */
      const { content_type, type, file_name } = req.params as {
        content_type: string | undefined;
        type: string | undefined;
        file_name: string | undefined;
      };

      console.log({ content_type, type, file_name });
      // This is the information that needed to fetch the file

      /**
       Please take note of the required fields from "demo_file_info" which is the dat your get from uploading a file.
       
       NB: For images ONLY you get "uploadThumbnailData" AND "uploadRegularData" while every other file type ONLY has "uploadRegularData"
       *  */
      return await FileManagement.fetchFile({
        fileName: `${type}/${file_name}`,
        contentType: `${content_type}`,
        res,
      });
    } catch (error: ErrorType) {
      return res.status(200).json({
        valid: false,
        code: "DEMO000003B",
        msg: error.msg || "Something went wrong.",
      });
    }
  }

  /**Demo handling url queries */
  static async handle_queries(req: Request, res: Response, next: NextFunction) {
    const { a, b, c } = req.query as {
      a: string | undefined;
      b: string | undefined;
      c: string | undefined;
    };
    console.log({ a, b, c });
    return res.status(200).json({ a, b, c });
  }

  /**Demo handling url params */
  static async handle_params(req: Request, res: Response, next: NextFunction) {
    const { x, y, z } = req.params as {
      x: string | undefined;
      y: string | undefined;
      z: string | undefined;
    };
    console.log({ x, y, z });
    return res.status(200).json({ x, y, z });
  }

  /**Example Inserting user into MySQL Database */
  static async create_user_mysql(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      /**We generate a random user. */
      const demo_user = generate_user();

      console.time("create_user_mysql");

      /**We connect to the SQL database */
      const sql = await connect_sql();
      /**We Insert the data into the Demo table */
      const [info] = (await sql.query(
        `insert into demo(name, age, dob, userType) values(?, ?, ?, ?)`,
        [demo_user.full_name, demo_user.age, demo_user.dob, demo_user.userType]
      )) as { insertId: number }[];

      /**Generating a 'socketRoomId' which we can use to create a socket room for all the socket connection link to the specified user. */
      const socketRoomId = uuidv4();
      /**Insert 'socketRoomId' into 'DemoSocketRoomId' with the '_id' of the newly created user which is used for the relation.*/
      await sql.query(
        `insert into DemoSocketRoomId(demo_id, socketRoomId) values(?, ?)`,
        [info.insertId, socketRoomId]
      );

      /**Creating a new type 'SelectDemoUserType' with 'QueryResult' linked with the 'DemoTypes' in an array as it will be return from the query. Now the user will have all the types for the result.*/
      type SelectDemoUserType = QueryResult & [DemoTypes];

      /**We retrieve the user info from the demo table */
      const [query_res] = (await sql.query(`select * from demo where _id=?`, [
        info.insertId,
        /**Here we assigned the 'SelectDemoUserType' so we know the types of the data that should be returned*/
      ])) as SelectDemoUserType[];
      sql.end();

      const userClassStaticFetch = await DemoClassSQL.fromQuery(
        query_res[0]._id || ""
      );

      console.timeEnd("create_user_mysql");

      /**Validating if there is a result */
      if (query_res.length <= 0)
        throw { msg: "User not found", code: "QUY0000001" };

      /**The user info is pull which is the 'DemoTypes' which is in an array */
      const userObj = new DemoClassSQL(
        query_res[0]._id || "",
        query_res[0].name,
        query_res[0].age,
        query_res[0].dob,
        query_res[0].userType,
        socketRoomId
      );
      // console.log({ userClassStaticFetch, userObj });
      await userObj.updateDOB(faker.date.birthdate());
      // console.log({ userObj });

      /**Close SQL connection*/

      return res.status(200).json({ data: userObj.returnData(), valid: true });
    } catch (error: ErrorType) {
      console.log({ error });
      return res.status(200).json({
        valid: false,
        code: "DEMO000007",
        msg: error.msg || "Something went wrong.",
      });
    }
  }

  /**
   * Example Inserting user into PostGres Database "Demo" and insert "DemoSocketRoomId"
   */
  static async create_user_postgres(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const demo_user = generate_user();

      const socketRoomId = uuidv4();

      console.time("create_user_postgres");

      const data = await query_pg(
        `insert into demo(name, age, dob, userType) values($1, $2, $3, $4) returning _id, name, age, dob, userType, createdAt, updatedAt;`,
        [demo_user.full_name, demo_user.age, demo_user.dob, demo_user.userType]
      );

      const user = data.rows[0] as DemoTypes;

      await query_pg(
        `insert into "DemoSocketRoomId"(socket_room_id, demoid) values($1, $2);`,
        [socketRoomId, user._id || ""]
      );

      console.timeEnd("create_user_postgres");

      return res
        .status(200)
        .json({ data: { ...user, socketRoomId }, valid: true });
    } catch (error: ErrorType) {
      console.log({ error });
      return res.status(200).json({
        valid: false,
        code: "DEMO000008",
        msg: error.msg || "Something went wrong.",
      });
    }
  }

  /**
   * Example Inserting user into MySQL Database "Demo" and insert "DemoSocketRoomId"
   */
  static async create_user_mongo(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      /**We generate a random user. */
      const demo_user = generate_user();

      console.time("create_user_mongo");

      /**Using the predefined Schema Static function */
      const demo_static_result = await Demo_User.createDemo({
        name: demo_user.full_name,
        age: demo_user.age,
        dob: demo_user.dob,
        userType: demo_user.userType,
      });
      console.timeEnd("create_user_mongo");

      /**Create a 'Demo' document with the user info from 'demo_user' 
       * 
          const demo_user = generate_user();
          
          const data = new Demo_User({
            _id: demo_user.userId,
            name: demo_user.full_name,
            age: demo_user.age,
            dob: demo_user.dob,
            userType: demo_user.userType,
          });
          
          await data.save();
      */

      /**We use the method function the change the ago with ease without using 'updateOne' etc. ensure to use the 'await' flag. */
      await demo_static_result.updateDOB(faker.date.birthdate());

      return res.status(200).json({ demo_static_result, valid: true });
    } catch (error: ErrorType) {
      console.log({ error });
      return res.status(200).json({
        valid: false,
        code: "DEMO000009",
        msg: error.msg || "Something went wrong.",
      });
    }
  }
}

export default DemoController;
