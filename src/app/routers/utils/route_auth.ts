import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../../utils/jwt";

// Example to authentication check before route
export async function check_number(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { number } = req.body;
    // validate user for specified routes
    if (!number) throw { msg: "No number found" };

    next();
  } catch (error: any) {
    res.status(400).json({
      valid: false,
      mag: error.msg || "Something went wrong.",
      code: "AUTH0000001",
    });
  }
}

export async function valid_req(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // The server is first pinged where a systemToken which ahs the device/system info and ping to keep track of device and user interaction.
    const { systemToken, ping } = req.cookies;

    // validate user for specified routes
    if (!systemToken || !ping) {
      throw { msg: "No valid cookie found." };
    }

    const systemTokenData = await verifyToken(systemToken);
    const pingData = await verifyToken(ping);

    next();
  } catch (error: any) {
    res.status(400).json({
      valid: false,
      mag: error.msg || "Something went wrong.",
      code: "AUTH0000002",
    });
  }
}
