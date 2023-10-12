import { Request, Response } from 'express';
import {
  findAndInsert,
  find,
  findAndUpdate,
  findBySearchKey,
  findByCategoryId
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
  const {page, rowsLimitInPage} = req.query;
  const [success,result] = await find(page, rowsLimitInPage);
  sendResponse(res,success,result);
};

export const getAllProductsByString = async (req: Request, res: Response): Promise<void> => {
  const {searchKey} = req.query;
  if(!searchKey) {
      console.log("Please pass valid search key query parameter.");
      sendResponse(res, false, "Please pass valid searchKey in query parameters.");
  } else {
      const [success,result] = await findBySearchKey(searchKey);
      sendResponse(res,success,result);
  }
};

export const getProductByCategoryId = async (req: Request, res: Response): Promise<void> => {
  const {categoryId} = req.query;
  const [success,result] = await findByCategoryId(categoryId);
  sendResponse(res,success,result);
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  const {productId} = req.query;
  const productDetails = req.body;
  const [success,result] = await findAndUpdate(productId, productDetails);
  sendResponse(res,success,result);
};

