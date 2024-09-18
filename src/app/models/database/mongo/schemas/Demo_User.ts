import mongoose, { ClientSession } from "mongoose";
import { v4 as uuidv4 } from "uuid";

import { MONGO_DEFAULT_DATABASE } from "../dbConnections";

/**Mongodb Document type */
import { Document } from "mongoose"; // Mongodb Document type
/**Importing type for this specific collection */
import { DemoTypes, UserType } from "../../types/Demo_Types";
/**Importing schemas array to push this schema's name to it. */
import { schemas } from "../../../../../config/mongo/config";
import DemoAccount from "./Demo_account";
import { getRandomNumber } from "../../../../utils/helpers";

const MainDb = MONGO_DEFAULT_DATABASE;
const Schema = mongoose.Schema;

const collection = "Demo_User";
/**Adding collection name to schemas array so we can keep tract of all collections*/
schemas.push(collection);

/**
 * Creating a custom Type for the schema that includes mongoose 'Document' type.
 * Here we can add the 'methods' to the type so it can be used with intellisense.
 * */
export type DemoSchemaType = Document &
  DemoTypes & {
    updateDOB: (x: Date) => Promise<DemoSchemaType>;
    updateName: (x: string) => Promise<DemoSchemaType>;
  };

export type DemoModelType = mongoose.Model<DemoSchemaType> & {
  createDemo: (x: DemoTypes) => Promise<DemoSchemaType>;
};

/** Creating a mongodb schema */
const demoSchema = new Schema<DemoSchemaType>(
  {
    _id: {
      type: String,
      required: true,
      default: () => uuidv4(),
      // immutable: true,
    },
    name: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
    },
    dob: {
      type: Date,
      required: true,
    },
    userType: {
      type: String,
      required: true,
      enum: Object.values(UserType),
    },
    socketRoomId: {
      type: String,
      unique: true,
      required: true,
      default: () => uuidv4(),
      // immutable: true,
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
 * Mongoose pre-save hook for the `demoSchema`.
 *
 * This function is executed asynchronously before a document is saved to the database.
 * It provides an opportunity to perform validations, transformations, or other modifications
 * on the document before persistence.
 *
 * @this {mongoose.Document} - The document being saved.
 * @param {function(Error=): void} next - Callback function to signal completion or indicate an error.
 *                                          Call `next()` to proceed with saving, or pass an `Error` object to abort.
 *
 * @example
 * ```javascript
 * demoSchema.pre('save', async function (next) {
 *   // Example validation:
 *   if (!this.name) {
 *     return next(new Error('Name is required'));
 *   }
 *
 *   // Example transformation:
 *   this.name = this.name.toUpperCase();
 *
 *   next();
 * });
 * ```
 *
 * @see {@link https://mongoosejs.com/docs/middleware.html#pre} for more information and examples on Mongoose pre-save hooks and others.
 */
demoSchema.pre(
  "save",
  async function (next: mongoose.CallbackWithoutResultAndOptionalError) {
    try {
      const doc = this as DemoSchemaType;

      if (
        !doc.isNew &&
        (doc.isModified("_id") || doc.isModified("createdAt"))
      ) {
        doc.invalidate("readOnlyField", "Certain fields cannot be modified");
      }

      next();
    } catch (error) {
      console.log({ error });
    }
  }
);

/**Schema Static function, used to create a new document and other function alongside creating the document
 * This example creates a 'Demo' document and also creates a 'DemoAccount' document.
 */
demoSchema.statics.createDemo = async function (
  data: DemoTypes
): Promise<DemoSchemaType> {
  const session: ClientSession = await mongoose.startSession();
  session.startTransaction();

  try {
    const a_demo: DemoSchemaType = new this(data);
    await a_demo.save({ session });

    /**Creating a new account when a user is created. */
    if (!a_demo._id) {
      await session.abortTransaction();
      throw new Error("Missing information.");
    }
    const new_demo_account = new DemoAccount({
      demo_id: a_demo._id,
      balance: getRandomNumber(200000, 50000000),
    });
    await new_demo_account.save({ session });

    await session.commitTransaction();

    return a_demo;
  } catch (error) {
    await session.abortTransaction();
    console.log("demoSchema Error - CreateDemo", { error });
    throw error;
  } finally {
    if (!session.hasEnded) {
      session.endSession();
    }
  }
};

/**
 * Adding method function to streamline productivity, here we can create functions that this document will do frequently.
 *
 * eg: This is a function that changes the age of a user.
 */
demoSchema.method(
  "updateDOB",
  async function (new_dob: Date): Promise<DemoSchemaType> {
    try {
      const doc = this as DemoSchemaType;

      doc.dob = new_dob;
      const user_dob_year = doc.dob.getFullYear();
      doc.age = new Date().getFullYear() - user_dob_year;
      await doc.save();

      return doc;
    } catch (error) {
      throw error;
    }
  }
);

/**Another way to create a method function */
demoSchema.methods.updateName = async function (
  new_name: string
): Promise<DemoSchemaType> {
  const doc = this as DemoSchemaType;

  doc.name = new_name;
  await doc.save();

  return doc;
};

/**Demo_User Schema
 * @description This collection has multiple built in functions such as methods and static which help to automate procedures.
 *
 * @example
 * // Using Static function which is on the Model level
 * // This creates a new Demo_User document and save it to the database.
 * const demo_static_result = await Demo_User.createDemo({
        _id: "co8379ch37egcvyivevcv",
        name: "Steve Jones",
        age: 32,
        dob: new Date("12/01/1992"),
        userType: "User",
      });
 * await demo_static_result.updateName("John Brown");


 * // Using a method(s) function which is on the Document level
 * const user = await Demo_User.findOne({_id: 1});
 * await user.updateName("John Brown");
 *
 *
 *
 */
const Demo_User = MainDb.model<DemoSchemaType, DemoModelType>(
  collection,
  demoSchema
);
/**Exporting schema to be used in application */
export default Demo_User;
