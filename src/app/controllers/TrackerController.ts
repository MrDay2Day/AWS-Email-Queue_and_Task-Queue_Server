import { NextFunction, Request, Response } from "express";
import axios from "axios";
import { EmailClassSQL } from "../models/global/email_mysql";
import { EMAIL_STATUS } from "../models/database/types/General_Types";
import ReturnAPIController from "./ReturnAPIController";
import { catchErrorPromise } from "../utils/catchError";

export default class TrackerController {
  static async openEmails(
    req: Request,
    res: Response,
    nex: NextFunction
  ): Promise<any> {
    try {
      res
        .writeHead(200, {
          "Content-Type": "image/gif",
          "Content-Length": "43",
        })
        .end(Buffer.from("R0lGODlhAQABAAAAACwAAAAAAQABAAA=", "base64"));

      const emailId = req.query.id as string;

      if (!emailId) {
        throw { msg: "Invalid!", status: 401, code: "6341200" };
      }

      const email_record = new EmailClassSQL();
      await email_record.fetchInfo({ id: emailId });
      if (!email_record.open) {
        await catchErrorPromise(email_record.emailOpen());

        await catchErrorPromise(
          ReturnAPIController.post_return(
            email_record.returnData().api_key,
            email_record.returnData().return_api,
            {
              status: "OPEN",
              email_id: email_record.id,
              data: {
                email_data: {
                  email: email_record.email,
                  send_email: email_record.send_email,
                  subject: email_record.subject,
                  data: email_record.data,
                  open: !!email_record.open,
                },
              },
            }
          )
        );
      }

      return;
    } catch (error: any) {
      return res.status(error.status || 200).json({
        msg: error.msg || error.sqlMessage || "Something went wrong.",
        valid: false,
        code: `TRK001_${error.code || "00045"}`,
      });
    }
  }

  static async emailStatus(
    req: Request,
    res: Response,
    nex: NextFunction
  ): Promise<any> {
    try {
      const messageType = req.headers["x-amz-sns-message-type"];
      if (!messageType) {
        throw { msg: "Invalid!", status: 401, code: "6341199" };
      }
      const messageJson = req.body;

      const message: any = {};

      const email_record = new EmailClassSQL();

      try {
        const data = await JSON.parse(messageJson);

        Object.keys(data).forEach((key) => (message[key] = data[key]));
      } catch (error) {
        console.log({ error });
      }

      // Handle SNS Subscription Confirmation
      if (messageType === "SubscriptionConfirmation") {
        const confirmUrl = message.SubscribeURL;
        // console.log("Confirming SNS Subscription:", confirmUrl);
        await axios.get(confirmUrl); // Confirm subscription
        return res.send("Subscription confirmed");
      }

      // Handle the notification message
      if (messageType === "Notification") {
        const notification = JSON.parse(message.Message);
        // console.log("SNS Notification:", { notification });

        const message_id = notification.mail.messageId;

        await email_record.fetchInfo({ message_id });

        // console.log({ message_id, email: email_record.returnData() });

        if (message_id) {
          // Handle send events
          if (notification.eventType === "Send") {
            const deliveryInfo = notification.delivery;
            // console.log(`Email delivered to: ${deliveryInfo.recipients}`);

            await email_record.updateRecord({
              message_id,
              status: EMAIL_STATUS.SENT,
            });
            // Update your database or log the delivery status
          }

          // Handle delivery events
          if (notification.eventType === "Delivery") {
            const deliveryInfo = notification.delivery;
            // console.log(`Email delivered to: ${deliveryInfo.recipients}`);

            await email_record.updateRecord({
              message_id,
              status: EMAIL_STATUS.DELIVERED,
            });
            // Update your database or log the delivery status
          }

          // Handle bounce events
          if (notification.eventType === "Bounce") {
            const bounceInfo = notification.bounce;
            // console.log(
            //   `Bounce Type: ${bounceInfo.bounceType}, Bounced Recipients: ${bounceInfo.bouncedRecipients}`
            // );

            await email_record.updateRecord({
              message_id,
              status: EMAIL_STATUS.BOUNCE,
            });
            // Update your database or handle bounces
          }

          // Handle complaints (if someone marks email as spam)
          if (notification.eventType === "Complaint") {
            const complaintInfo = notification.complaint;
            // console.log(
            //   `Complaint filed by: ${complaintInfo.complainedRecipients}`
            // );
            await email_record.updateRecord({
              message_id,
              status: EMAIL_STATUS.COMPLAINT,
            });
            // Update your database or handle complaints
          }

          await ReturnAPIController.post_return(
            email_record.returnData().api_key,
            email_record.returnData().return_api,
            {
              status: email_record.status,
              email_id: email_record.id,
              data: {
                email_data: {
                  email: email_record.email,
                  send_email: email_record.send_email,
                  subject: email_record.subject,
                  data: email_record.data,
                  open: !!email_record.open,
                },
                aws_data: notification,
              },
            }
          );
        }
      }

      return res.status(200).send("OK");
    } catch (error: any) {
      return res.status(error.status || 200).json({
        msg: error.msg || error.sqlMessage || "Something went wrong.",
        valid: false,
        code: `TRK001_${error.code || "00001"}`,
      });
    }
  }
}
