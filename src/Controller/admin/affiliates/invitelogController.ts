import { Request, Response } from "express";

import{inviteLogsInternal,inviteLogsSpecificAffiliateInternal} from "./invitelogHandler"

export const inviteLogs = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const {id}= (req as any).query 
      const [success, result] = await inviteLogsInternal();
      if (success) {
        res.status(200).send({ result, Active: true });
      } else {
        res.status(400).send({ message: result, Active: false });
      }
    } catch (error) {
      console.error("Error in getAllKYCRecords:", error);
      res.status(500).json({ error: "An error occurred", Active: false });
    }
  };


  // export const inviteLogsSpecificAffiliate = async (
  //   req: Request,
  //   res: Response
  // ):Promise<void> => {
  //   try {
  //     const {id}= (req as any).query 
  //     const [success, result] = await inviteLogsSpecificAffiliateInternal(id);
  //     if (success) {
  //       res.status(200).send({ result, Active: true });
  //     } else {
  //       res.status(400).send({ message: result, Active: false });
  //     }
  //   } catch (error) {
  //     console.error("Error in getAllKYCRecords:", error);
  //     res.status(500).json({ error: "An error occurred", Active: false });
  //   }
  // };
 
  export const inviteLogsSpecificAffiliate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, rowsPerPage, page, commission } = req.query;
      const [success, result] = await inviteLogsSpecificAffiliateInternal(id, rowsPerPage, page, commission);
      if (success) {
        res.status(200).send({ result, Active: true });
      } else {
        res.status(400).send({ message: result, Active: false });
      }
    } catch (error) {
      console.error("Error in inviteLogsSpecificAffiliate:", error);
      res.status(500).json({ error: "An error occurred", Active: false });
    }
  };
