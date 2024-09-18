// Mongoose options

import mongoose, { ConnectOptions } from "mongoose";
import path from "path";
import { MongoMainListener } from "../../app/models/database/mongo/listener/listeners";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { text_bright_cyan, text_cyan } from "../../utils/serverDataInfo";

export const MONGOOSE_OPTIONS: ConnectOptions = {
  readPreference: mongoose.mongo.ReadPreference.PRIMARY,
  dbName: process.env.MONGO_DEFAULT_DATABASE,
  noDelay: true,
  retryWrites: true,
};

/**An array of all Schemas used. */
export const schemas: string[] = [];

export function ConnectMongoDB(): Promise<{
  valid: Boolean;
  [key: string]: any;
}> {
  console.log(text_bright_cyan("\tCONNECTING TO MONGODB DATABASE..."));
  return new Promise(async function (resolve, reject) {
    const is_dev = process.env.MONGO_USE_INTERNAL_SERVER;

    const dev_server = is_dev
      ? await MongoMemoryReplSet.create({
          binary: {
            version: "7.0.11",
          },
          instanceOpts: [
            {
              port: 50111,
              storageEngine: "wiredTiger",
              dbPath: path.resolve(__dirname, "temp", "storage_1"),
            },
            {
              port: 50112,
              storageEngine: "wiredTiger",
              dbPath: path.resolve(__dirname, "temp", "storage_2"),
            },
            {
              port: 50113,
              storageEngine: "wiredTiger",
              dbPath: path.resolve(__dirname, "temp", "storage_3"),
            },
          ],
          replSet: {
            name: process.env.MONGO_REPLICA_SET_1,
            dbName: process.env.MONGO_DEFAULT_DATABASE,
          },
        })
      : null;

    if (dev_server?.waitUntilRunning) {
      dev_server?.waitUntilRunning();
      console.log(
        text_cyan(`\t\t-> MongoDB_Dev_Server --> ${dev_server.getUri()}`)
      );
    }
    const uri = is_dev
      ? dev_server?.getUri() || ""
      : process.env.MONGO_URL || "";

    await mongoose
      .connect(uri, MONGOOSE_OPTIONS)
      .then(async (data) => {
        console.log(
          text_cyan(
            `\t\t-> MongoDB Database ${process.env.MONGO_DEFAULT_DATABASE} initialized.`
          )
        );
        schemas.forEach((x) =>
          console.log(text_cyan(`\t\t-> MongoDB Collection ${x} initialized.`))
        );
        console.log(text_bright_cyan("\tMONGODB DATABASE CONNECTED!\n"));

        // if (process.env.MONGO_USE_REPLICA_SET) MongoMainListener();
        resolve({ valid: true, data });
      })
      .catch((mongoErr: any) => {
        console.log({ mongoErr });
        reject({ valid: false, mongoErr });
      });
  });
}
