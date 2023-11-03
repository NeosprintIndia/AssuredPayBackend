import { Request, Response } from 'express';
import {
  findAndInsert,
  find,
  findAndUpdate,
  verifyPANDetails
} from "./affiliateHandler";

function sendResponse(res: Response, success: Boolean, result: any){
  if(success)  res.send({result, Active:true});
  else res.status(500).send({message: result, Active:false});
}

export const createAffiliate = async (req: Request, res: Response): Promise<void> => {
  const affiliateDetails = req.body;
  const [success,result] = await findAndInsert(affiliateDetails);
  sendResponse(res,success,result);
};

export const getAffiliates = async (req: Request, res: Response): Promise<void> => {
  const {role, searchKey, page, rowsLimitInPage} = (req as any).query ;
  const [success,result] = await find(role, searchKey, page, rowsLimitInPage);
  sendResponse(res,success,result);
};

export const updateAffiliate = async (req: Request, res: Response): Promise<void> => {
  const {affiliateId} = (req as any).query;
  const affiliateDetails = req.body;
  const [success,result] = await findAndUpdate(affiliateId, affiliateDetails);
  sendResponse(res,success,result);
};
export const verifyPAN = async (req: Request, res: Response): Promise<void> => {
  try {
    const PanNumber = req.body.PanNumber as string;
    const id = (req as any).userId as string; // Assuming userId is a string
    const [success, result] = await verifyPANDetails(PanNumber, id);
    if (success) {
      res.status(200).send({ result, Active: true });
    } else {
      res.status(400).send({ result, Active: false });
    }
  } catch (error) {
    console.error({ message: "Error in verifyPAN:", error, Active: false });
    res.status(500).json({ error: "An error occurred", Active: false });
  }
};
