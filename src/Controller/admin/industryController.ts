import { Request, Response } from 'express';
import {
  findAndInsert,
  find,
  findAndUpdate
} from './industryHandler';

function sendResponse(res: Response, success: Boolean, result: any){
  if(success)  res.send({result, Active:true});
  else res.status(500).send({message: result, Active:false});
}

export const addIndustry = async (req: Request, res: Response): Promise<void> => {
  const industryDetails = req.body;
  const [success,result] = await findAndInsert(industryDetails);
  sendResponse(res,success,result);
};

export const getIndustry = async (req: Request, res: Response): Promise<void> => {
  const {searchKey, page, rowsLimitInPage} = req.query;
  const [success,result] = await find(searchKey, page, rowsLimitInPage);
  sendResponse(res,success,result);
};

export const updateIndustry = async (req: Request, res: Response): Promise<void> => {
  const {industryId} = req.query;
  const industryDetails = req.body;
  const [success,result] = await findAndUpdate(industryId, industryDetails);
  sendResponse(res,success,result);
};

