import { Request, Response } from 'express';
import {
  findAndInsert,
  get,
  addBankAccountInternal } from './affiliatePortalHandler';

function sendResponse(res: Response, success: Boolean, result: any){
  if(success)  res.send({result, Active:true});
  else res.status(500).send({message: result, Active:false});
}

export const addIvite = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId as string;
  const {businessInvitedMail, businessInvitedNumber} = req.body;
  const [success,result] = await findAndInsert(userId, businessInvitedMail, businessInvitedNumber);
  sendResponse(res,success,result);
};

export const getInvite = async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).userId as string;
    const {rowsPerPage, page, commission} = req.query;
    const [success,result] = await get(userId, rowsPerPage, page,commission);
    sendResponse(res,success,result);
  };
  export const addBankAccount=async(req:Request,res:Response): Promise<void>=>{
    const userId=(req as any).userId ;
    const { bankAccountNumber,ifsc,bankName,benificiaryName }=req.body;
    const[success,result]=await addBankAccountInternal (userId, bankAccountNumber,ifsc,bankName,benificiaryName);
    sendResponse(res,success,result);
  }