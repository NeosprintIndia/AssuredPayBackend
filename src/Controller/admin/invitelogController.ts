import { Request, Response } from "express";

import{inviteLogsInternal} from "./invitelogHandler"

export const inviteLogs = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const [success, result] = await inviteLogsInternal();
    if (success) {
      res.send({ result, Active: true });
    } else {
      res.status(400).send({
        message: result,
        Active: false,
      });
    }
  };

