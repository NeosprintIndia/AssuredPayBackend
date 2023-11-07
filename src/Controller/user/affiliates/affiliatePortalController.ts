import { Request, Response } from 'express';
import {
  findAndInsert,
  get,
  addBankAccountInternal,
  //verifyBankAccountInternal,
  getBankAccountsInternal} from './affiliatePortalHandler';

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

export const getBankAccounts = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId=(req as any).userId ;
      const [success, result] = await getBankAccountsInternal(userId);
      if (success) {
        res.status(200).send({ result, Active: true });
      } else {
        res.status(400).send({ message: result, Active: false });
      }
    } catch (error) {
      console.error("Error in inviteLogsSpecificAffiliate:", error);
      res.status(500).json({ error: "An error occurred", Active: false });
    }
  };

  // export const verifyBankAccount = async (req: Request, res: Response): Promise<void> => {
  //   try { 
  //     const { bankAccountNumber,ifsc,bankName,benificiaryName }=req.body;
  //     const id = (req as any).userId as string; // Assuming userId is a string
  
  //     const [success, result] = await verifyBankAccountInternal(bankAccountNumber,ifsc,bankName,benificiaryName);
  
  //     if (success) {
  //       res.status(200).send({ result, Active: true });
  //     } else {
  //       res.status(400).send({ result, Active: false });
  //     }
  //   } catch (error) {
  //     console.error({ message: "Error in Bank Account Verify:", error, Active: false });
  //     res.status(500).json({ error: "An error occurred", Active: false });
  //   }
  // };