import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

import { MONGO_DEFAULT_DATABASE } from "../dbConnections";

/**Mongodb Document type */
import { Document } from "mongoose"; // Mongodb Document type
/**Importing type for this specific collection */
import { DemoAccountTypes } from "../../types/Demo_Types";
/**Importing schemas array to push this schema's name to it. */
import { schemas } from "../../../../../config/mongo/config";

const MainDb = MONGO_DEFAULT_DATABASE;
const Schema = mongoose.Schema;

const collection = "Demo_Account";
/**Adding collection name to schemas array so we can keep tract of all collections*/
schemas.push(collection);
/**
 Creating a custom Type for the schema that includes mongoose 'Document' type. 
 */
export type DemoAccountSchemaType = Document &
  DemoAccountTypes & {
    /**Here we can add the 'methods' to the type so it can be used with intellisense.*/
    updateBalance: (x: number) => Promise<DemoAccountSchemaType>;
  };

/** creating a mongodb  */
const demoAccountSchema = new Schema<DemoAccountSchemaType>(
  {
    _id: {
      type: String,
      required: true,
      default: () => uuidv4(),
      // immutable: true,
    },
    demo_id: {
      type: String,
      required: true,
      ref: "Demo_User",
      // validate: {
      //   validator: async function (value: string) {
      //     // Check if the referenced Demo_User exists
      //     const user = await Demo_User.findById(value);
      //     return !!user;
      //   },
      //   message: (props: { value: string }) =>
      //     `Demo_User with id ${props.value} does not exist`,
      // },
    },
    account: {
      type: String,
      required: true,
      default: () => uuidv4(),
      // immutable: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    /**Added timestamp 'createAt' and 'updatedUp' */
    timestamps: true,
    /**Added sharded key for when database is sharded. */
    shardKey: { _id: 1 },
  }
);

/**
 * Pre-save middleware for the demoAccountSchema.
 *
 * This middleware is triggered before saving a document. It ensures that
 * certain fields (_id, account, createdAt) cannot be modified once the document
 * is created.
 *
 * @param {Function} next - The callback function to proceed to the next middleware.
 * @returns {void}
 */
demoAccountSchema.pre("save", async function (next) {
  const demoAccount = this as DemoAccountSchemaType;
  if (
    !demoAccount.isNew &&
    (demoAccount.isModified("_id") ||
      demoAccount.isModified("account") ||
      demoAccount.isModified("createdAt"))
  ) {
    demoAccount.invalidate(
      "readOnlyField",
      "Certain fields cannot be modified"
    );
  }

  next();
});

/**
 * Adding method function to streamline productivity, here we can create functions that this document will do frequently.
 *
 * eg: This is a function that changes the age of a user.
 */
demoAccountSchema.method("updateBalance", async function (bal: number) {
  try {
    this.balance = this.balance + bal;
    await this.save();
    return this;
  } catch (error) {
    throw error;
  }
});

/**Creating schema in database*/
const DemoAccount = MainDb.model<DemoAccountSchemaType>(
  collection,
  demoAccountSchema
);
/**Exporting schema to be used in application */
export default DemoAccount;
