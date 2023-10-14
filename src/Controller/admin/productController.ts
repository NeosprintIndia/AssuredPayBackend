import { Request, Response } from 'express';
import {
  findAndInsert,
  find,
  findAndUpdate
} from './productHandler';

function sendResponse(res: Response, success: Boolean, result: any){
  if(success)  res.send({result, Active:true});
  else res.status(500).send({message: result, Active:false});
}

export const addProduct = async (req: Request, res: Response): Promise<void> => {
  const productDetails = req.body;
  const [success,result] = await findAndInsert(productDetails);
  sendResponse(res,success,result);
};

export const getProduct = async (req: Request, res: Response): Promise<void> => {
  const {searchKey,categoryId, page, rowsLimitInPage} = req.query;
  const [success,result] = await find(searchKey, categoryId, page, rowsLimitInPage);
  sendResponse(res,success,result);
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  const {productId} = req.query;
  const productDetails = req.body;
  const [success,result] = await findAndUpdate(productId, productDetails);
  sendResponse(res,success,result);
};

