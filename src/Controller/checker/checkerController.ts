import { Request, Response } from "express";
import {
 getMakerRequestInternal ,
 checkeractionInternal,
 viewparticularrequestInternal,
 getpaymentrequestInternal,
actionPaymentRequestInternal,
 businessActionOnPaymentRequestInternal,
 getAllMyMakerInternal,
 manageMyMakerInternal,
createPaymentRequestHandler,
getAllPaymentOfCheckerInternal,
getrecievablesInternal
} from "./checkerHandler";

import { sendDynamicMail } from "../../services/sendEmail";
import { sendSMS } from "../../services/sendSMS";

export async function createPaymentChecker(req: Request, res: Response) {
  try {
    const { business_id, paymentType, POPI,orderAmount,paymentIndentifier,paymentDays,MilestoneDetails,orderTitle,remark} = req.body;
    const userid=(req as any).userId
    const [success, result] = await createPaymentRequestHandler(
      orderTitle,  business_id, paymentType, POPI,orderAmount,paymentIndentifier,paymentDays,MilestoneDetails,userid,remark
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
export async function getAllPaymentOfChecker(req: Request, res: Response) {
  try { 
    const { paymentIndentifier } = req.query;
    const userid=(req as any).userId
    console.log("USERID",userid)
    const [success, result] = await getAllPaymentOfCheckerInternal(userid,paymentIndentifier);
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
    const userId=(req as any).userId
    const [success, result] = await businessActionOnPaymentRequestInternal(docId,action,remark,userId);

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
export async function getpaymentrequest(req: Request, res: Response) {2
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
export async function viewparticularrequest(req: Request, res: Response) {
  try {
    const userid=(req as any).userId
    const { docId,gst,businessName } = (req as any).query;
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
export async function getrecievables(req: Request, res: Response) {
  try { 
    const { startDate, endDate } = req.query;
    const userid=(req as any).userId
    console.log("USERID",userid)
    const [success, result] = await getrecievablesInternal(userid, startDate,endDate);
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


//Makers 
export async function actionPaymentRequest(req: Request, res: Response) {
  try {
    const {action,docId ,remark}=req.body
    const userid=(req as any).userId
    const [success, result] = await actionPaymentRequestInternal(docId,action,remark,userid);
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
    const userid=(req as any).belongsto
    const [success, result] = await checkeractionInternal(docId,action,remark,userid);
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
export async function getmakerrequest(req: Request, res: Response) {
    try {
      const userid=(req as any).userId
      console.log("USERID",userid)
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
  export async function getAllMyMaker(req: Request, res: Response) {
    try {
      const userid = (req as any).userId;
      const {page, rowsLimitInPage} = req.query;
      const [success, result] = await getAllMyMakerInternal(userid,page,rowsLimitInPage);
      if (success) {
        res.status(200).send({ result });
      } else {
        res.status(500).send({ error: "Error fetching data" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: "Internal Server Error" });
    }
}
  export const manageMyMaker = async (req: Request, res: Response): Promise<void> => {
    const { user,status } = req.body;
      const [success,result] = await manageMyMakerInternal(user,status);
      if (success) {
        res.send({result,Active:true});
      } else {
        res.status(500).send({
          message: result,Active:false
        });
      }
};



 

