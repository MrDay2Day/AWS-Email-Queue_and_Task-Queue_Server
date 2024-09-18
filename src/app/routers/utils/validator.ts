import { body } from "express-validator";
import bcrypt from "bcrypt";

const validator = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const phoneCheck = body("phone")
  .custom((value: string | number, { req }: { req: any }) => {
    const body = req.body;
    // console.log({ value });
    if (body) {
      if (body.phone) {
        return body.phone;
      } else {
        return false;
      }
    } else {
      return false;
    }
  })
  .exists()
  .withMessage("Please enter a valid phone number. eg: +1(876) 123-4567")
  .isInt()
  .isMobilePhone("any")
  .isLength({ min: 10, max: 15 })
  .withMessage("Please enter a valid phone number. eg: +1(876) 123-4567");

const phoneValidationCheck = body("phone")
  .exists()
  .withMessage("Please enter a valid phone number. eg: (876) 123-4567")
  .isInt()
  .isMobilePhone("any")
  .isLength({ min: 10, max: 10 })
  .withMessage("Please enter a valid phone number. eg: (876) 123-4567");

const emailCheck = body("email")
  .trim()
  .normalizeEmail()
  .isEmail()
  .withMessage("Please enter a valid email.");

const emailCheckExists = body("email")
  .trim()
  .normalizeEmail()
  .isEmail()
  .withMessage("Please enter a valid email.")
  .custom(async (value: any, { req }: { req: any }) => {
    // Check if email exist in database then return the following
    /**
     *  return Promise.reject(
          `The email already exist, please try another email. If this is an issue please contact support.`
        );
     */
  });

const password_Check = body("password")
  .trim()
  .isLength({ min: 8 })
  .withMessage("Password be 8 or more characters.")
  .custom((value: any, { req }: { req: any }) => {
    if (validator.test(value) == false) {
      throw new Error(
        "Password should be 8 or more characters, must contain at least one lowercase letter, one uppercase letter, one numeric digit."
      );
    }
    return true;
  });

// //
export const signUpCheck = [emailCheckExists, password_Check, phoneCheck];
export const socialSignUpCheck = [emailCheckExists, password_Check];
export const pass_validator = validator;
export const email_validator = [emailCheck];
