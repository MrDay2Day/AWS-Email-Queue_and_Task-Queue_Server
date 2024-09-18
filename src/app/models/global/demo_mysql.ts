// Object-Oriented approach with MongoDB Documents.

import { v4 as uuidv4 } from "uuid";

import { QueryResult } from "mysql2";
import { connect_sql } from "../../../config/mysql/config";
import { UserType, DemoTypes } from "../database/types/Demo_Types";

/**
 * The `DemoClassSQL` class represents a user or an entity in the database.
 * It provides methods to create instances from database queries, update the date of birth, and return the data.
 *
 * @implements {DemoTypes}
 *
 * @class
 * @example
 * // Create a new instance of the class
 * const demo = new DemoClassSQL("1", "John Doe", 25, new Date("1998-01-01"), "Admin");
 *
 * @example
 * // Fetch a user from the database
 * DemoClassSQL.fromQuery("1")
 *   .then(user => {
 *     console.log(user);
 *   })
 *   .catch(error => {
 *     console.error(error);
 *   });
 *
 * @example
 * // Update the date of birth of the user
 * demo.updateDOB(new Date("2000-01-01"))
 *   .then(() => {
 *     console.log("Date of birth updated.");
 *   })
 *   .catch(error => {
 *     console.error(error);
 *   });
 *
 * @note
 * This class assumes that the database connection functions such as `connect_sql` and `uuidv4` are available in the scope.
 * Proper error handling should be implemented for production use.
 */
export class DemoClassSQL implements DemoTypes {
  _id: string;
  name: string;
  age: number | undefined;
  dob: Date;
  userType: UserType;
  socketRoomId?: string;
  constructor(
    _id: string,
    name: string,
    age: number | undefined,
    dob: Date,
    userType: UserType,
    socketRoomId?: string
  ) {
    this._id = _id;
    this.name = name;
    this.age = age;
    this.dob = dob;
    this.userType = userType;
    this.socketRoomId = socketRoomId;
  }

  async functionName() {
    try {
      //
    } catch (error) {
      console.log("functionName", { error });
    }
  }

  static async fromQuery(_id: string): Promise<DemoClassSQL> {
    try {
      const sql = await connect_sql();

      type SelectDemoUserType = QueryResult & [DemoTypes];
      /**We retrieve the user info from the demo table */
      const [query_res] = (await sql.query(`select * from demo where _id = ?`, [
        _id,
      ])) as SelectDemoUserType[];

      if (query_res.length <= 0)
        throw { msg: `No account associated with ${_id}` };

      type SocketTableIDType = {
        _id: string;
        demo_id: string;
        socketRoomId: string;
        created_at: Date;
        last_updated: Date;
      };
      type SelectSocketIdType = QueryResult & [SocketTableIDType];
      const [socket_res] = (await sql.query(
        `select * from DemoSocketRoomId where demo_id = ?`,
        [_id]
      )) as [SelectSocketIdType, any];

      let userSocketRoomId: string;

      if (socket_res.length <= 0) {
        const socketRoomId = uuidv4();
        await sql.query(
          `insert into DemoSocketRoomId(demo_id, socketRoomId) values(?, ?)`,
          [_id, socketRoomId]
        );
        userSocketRoomId = socketRoomId;
      } else {
        userSocketRoomId = socket_res[0].socketRoomId;
      }

      sql.end();

      return new DemoClassSQL(
        query_res[0]._id || "",
        query_res[0].name,
        query_res[0].age,
        query_res[0].dob,
        query_res[0].userType,
        userSocketRoomId
      );
    } catch (error: any) {
      console.log("fromQuery", { error });
      return error;
    }
  }

  async updateDOB(new_dob: Date) {
    try {
      const tempt_dob = new_dob;
      const user_dob_year = tempt_dob.getFullYear();
      const tempt_age = new Date().getFullYear() - user_dob_year;

      const sql = await connect_sql();

      const query = `UPDATE demo SET age = ?, dob = ? WHERE _id = ?`;
      const [res] = await sql.query(query, [tempt_age, tempt_dob, this._id]);
      sql.end();

      this.dob = tempt_dob;
      this.age = tempt_age;

      return;
    } catch (error) {
      console.log("updateAge", { error });
    }
  }

  returnData() {
    return {
      _id: this._id,
      name: this.name,
      age: this.age,
      dob: this.dob,
      userType: this.userType,
      socketRoomId: this.socketRoomId,
    };
  }
}
