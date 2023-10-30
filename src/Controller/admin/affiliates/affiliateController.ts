import { Request, Response } from 'express';
import {
  findAndInsert,
  find,
  findAndUpdate
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

