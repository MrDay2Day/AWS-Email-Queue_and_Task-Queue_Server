import mongoose from "mongoose";

const ADMIN_DEFAULT_DATABASE = mongoose.connection.useDb(
  process.env.ADMIN_DEFAULT_DATABASE || ""
);

const MONGO_DEFAULT_DATABASE = mongoose.connection.useDb(
  process.env.MONGO_DEFAULT_DATABASE || ""
);

export { ADMIN_DEFAULT_DATABASE, MONGO_DEFAULT_DATABASE };
