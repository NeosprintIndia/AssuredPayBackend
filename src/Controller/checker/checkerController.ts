import { Request, Response } from "express";
import {
 getMakerRequestInternal ,
 checkeractionInternal,
 viewparticularrequestInternal,
 getpaymentrequestInternal,
 actionPaymentRequestInternal,
 businessActionOnPaymentRequestInternal
} from "./checkerHandler";

import { sendDynamicMail } from "../../services/sendEmail";
import { sendSMS } from "../../services/sendSMS";

export async function getmakerrequest(req: Request, res: Response) {
    try {
      const userid=(req as any).userId
      const [success, result] = await getMakerRequestInternal(userid);
  
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
  
  export async function getpaymentrequest(req: Request, res: Response) {
    try {
      const userid=(req as any).userId
      const [success, result] = await getpaymentrequestInternal(userid);
  
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
 export async function checkeraction(req: Request, res: Response) {
    try {
      const {action,docId ,remark}=req.body
      console.log("action",action)
      console.log("docId",docId)

      const [success, result] = await checkeractionInternal(docId,action,remark);
  
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
  export async function viewparticularrequest(req: Request, res: Response) {
    try {
      const userid=(req as any).userId
      const { docId,gst,businessName } = (req as any).query;
      console.log("docId",docId)

      const [success, result] = await viewparticularrequestInternal(docId,gst,userid,businessName);
  
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
  export async function actionPaymentRequest(req: Request, res: Response) {
    try {
      const {action,docId ,remark}=req.body
      console.log("action",action)
      console.log("docId",docId)

      const [success, result] = await actionPaymentRequestInternal(docId,action,remark);
  
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
  export async function businessActionOnPaymentRequest(req: Request, res: Response) {
    try {
      const {action,docId ,remark}=req.body
      console.log("action",action)
      console.log("docId",docId)

      const [success, result] = await businessActionOnPaymentRequestInternal(docId,action,remark);
  
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