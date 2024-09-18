export enum UserType {
  Admin = "Admin",
  User = "User",
  Visitor = "Visitor",
}

export type DemoTypes = {
  readonly _id?: string;
  name: string;
  age?: number;
  dob: Date;
  userType: UserType;
  readonly socketRoomId?: string;
};

export type DemoAccountTypes = {
  readonly _id: string;
  readonly demo_id: string;
  readonly account: string;
  balance: number;
};

export type ErrorType = Error &
  any & {
    msg?: string;
    code?: string;
    valid: false;
    [key: string]: any;
  };
