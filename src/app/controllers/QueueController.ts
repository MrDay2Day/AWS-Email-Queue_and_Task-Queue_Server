import { NextFunction, Request, Response } from "express";
import { API_KEY_TYPE } from "../routers/utils/auth";
import {
  CustomQueue,
  EmitListenTypes,
  TaskTypes,
} from "../engines/customQueueEngine";
import { generateString, getRandomNumber } from "../utils/helpers";
import ReturnAPIController from "./ReturnAPIController";

const event_queue = new CustomQueue<{
  task: any;
  api_key: string;
  return_api: string;
}>();

event_queue.on(EmitListenTypes.EXPIRED, async (data) => {
  try {
    await ReturnAPIController.post_return(
      data.data.api_key,
      data.data.return_api,
      {
        queue_id: data.taskId.split("|")[1],
        expire_data: data.expiryDate,
        event: EmitListenTypes.EXPIRED,
        data: data.data.task,
      }
    );
  } catch (error) {
    console.log(`TASK-QUEUE-${EmitListenTypes.EXPIRED}-ERROR`, error);
  }
});
event_queue.on(EmitListenTypes.ADD, async (data) => {
  try {
    await ReturnAPIController.post_return(
      data.data.api_key,
      data.data.return_api,
      {
        queue_id: data.taskId.split("|")[1],
        expire_data: data.expiryDate,
        event: EmitListenTypes.ADD,
        data: data.data.task,
      }
    );
  } catch (error) {
    console.log(`TASK-QUEUE-${EmitListenTypes.ADD}-ERROR`, error);
  }
});
event_queue.on(EmitListenTypes.REMOVE, async (data) => {
  try {
    await ReturnAPIController.post_return(
      data.data.api_key,
      data.data.return_api,
      {
        queue_id: data.taskId.split("|")[1],
        expire_data: data.expiryDate,
        event: EmitListenTypes.REMOVE,
        data: data.data.task,
      }
    );
  } catch (error) {
    console.log(`TASK-QUEUE-${EmitListenTypes.REMOVE}-ERROR`, error);
  }
});

const g = generateString;

export default class QueueController {
  static async addToQueue(req: Request, res: Response, nex: NextFunction) {
    try {
      if (req.api_key_type !== API_KEY_TYPE.USER) {
        throw { msg: "Not Authorized!", status: 401, code: "6441192" };
      }

      const { body, api_key, allowed_api } = req;
      const { data, expiryDate } = body;

      if (!data || !expiryDate) {
        throw {
          msg: "Missing Field: - Required {data: {any} || expiryDate: Date}.",
          code: "60052",
        };
      }

      const expDate = new Date();
      expDate.setMilliseconds(
        expDate.getMilliseconds() + getRandomNumber(30, 60) * 1000
      );

      const taskId = `${g(20)}-${g(6)}-${g(12)}`;
      const queue_data = {
        taskId,
        data,
        expiryDate: expiryDate || expDate,
      } as TaskTypes<any>;

      event_queue.addTask(
        `${queue_data.taskId}|${api_key}`,
        {
          task: queue_data.data,
          api_key,
          return_api: allowed_api,
        },
        queue_data.expiryDate
      );

      return res.status(200).json({
        taskId,
        valid: true,
      });
    } catch (error: any) {
      return res.status(error.status || 200).json({
        msg: error.msg || error.sqlMessage || "Something went wrong.",
        valid: false,
        code: `QUE001_${error.code || "00001"}`,
      });
    }
  }

  static async removeFromQueue(req: Request, res: Response, nex: NextFunction) {
    try {
      if (req.api_key_type !== API_KEY_TYPE.USER) {
        throw { msg: "Not Authorized!", status: 401, code: "6441196" };
      }

      const { body, api_key } = req;
      const { queue_id } = body;

      if (!queue_id) {
        throw {
          msg: "Missing Field: - Required {queue_id: string}.",
          code: "60054",
        };
      }

      const removed = (await event_queue.removeTask(
        `${queue_id}|${api_key}`
      )) as Boolean;

      return res.status(200).json({
        removed,
        valid: true,
      });
    } catch (error: any) {
      return res.status(error.status || 200).json({
        removed: false,
        msg: error.msg || error.sqlMessage || "Something went wrong.",
        valid: false,
        code: `QUE001_${error.code || "00003"}`,
      });
    }
  }
}
