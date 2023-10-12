import { Request, Response } from 'express';
import {
  findAndInsert,
  find,
  findAndUpdate,
  findBySearchKey,
  findByIndustryId
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
  const {page, rowsLimitInPage} = req.query;
  const [success,result] = await find(page, rowsLimitInPage);
  sendResponse(res,success,result);
};

export const getAllCategoriesByString = async (req: Request, res: Response): Promise<void> => {
  const {searchKey} = req.query;
  if(!searchKey) {
      console.log("Please pass valid search key query parameter.");
      sendResponse(res, false, "Please pass valid searchKey in query parameters.");
  } else {
      const [success,result] = await findBySearchKey(searchKey);
      sendResponse(res,success,result);
  }
};

export const getCategoryByIndustryId = async (req: Request, res: Response): Promise<void> => {
  const {industryId} = req.query;
  const [success,result] = await findByIndustryId(industryId);
  sendResponse(res,success,result);
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  const {categoryId} = req.query;
  const categoryDetails = req.body;
  const [success,result] = await findAndUpdate(categoryId, categoryDetails);
  sendResponse(res,success,result);
};

