import { Request, Response } from "express";
import {createPaymentRequestHandler,
  performRegistration

  
} from "./makerHandler";

import { sendDynamicMail } from "../../services/sendEmail";
import { sendSMS } from "../../services/sendSMS";


export async function createPaymentRequest(req: Request, res: Response) {
    try {
      const { business_id, paymentType, POPI,orderAmount,paymentIndentifier,paymentDays,MilestoneDetails,orderTitle} = req.body;
      const userid=(req as any).userId
      const [success, result] = await createPaymentRequestHandler(
        orderTitle,  business_id, paymentType, POPI,orderAmount,paymentIndentifier,paymentDays,MilestoneDetails,userid
      );
  
      if (success) {
        res.status(200).send({ result });
      } else {
        res.status(404).send({ error: result });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  }
  export const createsubuser = async (req: Request, res: Response): Promise<void> => {
    const { business_email, username, business_mobile,role,} =
      req.body;
      const userid=(req as any).userId
    const [success, result] = await performRegistration(
      business_email,
      username,
      business_mobile,
      role,
      userid
    );
    const reqData = {
      Email_slug: "Business_Succesfully_Registered",
      email: business_email,
      VariablesEmail: [username, "Agent"],
  
      receiverNo: business_mobile,
      Message_slug: "Business_Succesfully_Registered",
      VariablesMessage: [username, "Agent"],
    };
  
    if (success) {
      await sendDynamicMail(reqData);
      await sendSMS(reqData);
      const result = { business_email:business_email,business_mobile:business_mobile,username:username };
      res.status(200).send({ result, Active: true });
    } else {
      res.status(400).send({ message: result, Active: false });
    }
  };