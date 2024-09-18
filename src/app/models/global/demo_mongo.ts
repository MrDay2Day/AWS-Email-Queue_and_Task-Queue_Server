import { Document } from "mongoose";
import { DemoSchemaType } from "../database/mongo/schemas/Demo_User";
import { UserType } from "../database/types/Demo_Types";

/**
 * The `DemoClass` represents a user or entity that extends a `Document`.
 * It provides methods to create instances from a document and update the age.
 *
 * @extends {Document}
 * 
 * @class
 * @example
 * // Creating a new instance of the class with a mongodb query response
 *import Demo from "../database/mongo/schemas/Demo";
 import { DemoClass } from "./path/to/DemoClass";

  // Find a document in the MongoDB collection
  const demoDoc = await Demo.findById("some-id");
  const demoInstance = DemoClass.fromDocument(demoDoc);
  @note "demoInstance" has all the functionality of "mongoose.Document" 

 * 
 * @class
 * @example
 * // Create a new instance of the class
 * const demo = new DemoClass("John Doe", 25, new Date("1998-01-01"), "Admin");
 *
 * @example
 * // Create an instance from a document
 * const doc = { name: "John Doe", age: 25, dob: new Date("1998-01-01"), userType: "Admin" };
 * const demoFromDoc = DemoClass.fromDocument(doc);
 *
 * @example
 * // Update the age of the user
 * demo.updateAge(26)
 *   .then(() => {
 *     console.log("Age updated.");
 *   })
 *   .catch(error => {
 *     console.error(error);
 *   });
 * 
 */
export class DemoClass extends Document {
  name: string;
  age?: number | undefined;
  dob: Date;
  userType: UserType;
  constructor(
    name: string,
    age: number | undefined,
    dob: Date,
    userType: UserType
  ) {
    super();
    this.name = name;
    this.age = age;
    this.dob = dob;
    this.userType = userType;
  }

  static fromDocument(doc: DemoSchemaType): DemoClass {
    return new DemoClass(doc.name, doc.age, doc.dob, doc.userType);
  }

  async updateAge(new_age: number) {
    this.age = new_age;
    this.save();
  }
}

/**



 */
