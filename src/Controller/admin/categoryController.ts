import { Request, Response } from 'express';
import {
  findAndInsert,
  find,
  findAndUpdate
} from './categoryHandler';

function sendResponse(res: Response, success: Boolean, result: any){
  if(success)  res.send({result, Active:true});
  else res.status(500).send({message: result, Active:false});
}

export const addCategory = async (req: Request, res: Response): Promise<void> => {
  const categoryDetails = req.body;
  const [success,result] = await findAndInsert(categoryDetails);
  sendResponse(res,success,result);
};

export const getCategory = async (req: Request, res: Response): Promise<void> => {
  const {searchKey, industryId, page, rowsLimitInPage} = req.query;
  const [success,result] = await find(searchKey, industryId, page, rowsLimitInPage);
  sendResponse(res,success,result);
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  const {categoryId} = req.query;
  const categoryDetails = req.body;
  const [success,result] = await findAndUpdate(categoryId, categoryDetails);
  sendResponse(res,success,result);
};

