import { Request, Response } from 'express';
import {
  findAndInsert,
  get,
  addBankAccountInternal,
  getBankAccountsInternal,
  addBankNamesInternal,
  BankNamesInternal} from './affiliatePortalHandler';

function sendResponse(res: Response, success: Boolean, result: any){
  if(success)  res.send({result, Active:true});
  else res.status(500).send({message: result, Active:false});
  };
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
    const { bankAccountNumber,ifsc,benificiaryName,bankName}=req.body;
    const[success,result]=await addBankAccountInternal (bankAccountNumber,ifsc,benificiaryName,bankName,userId,);
    sendResponse(res,success,result);
  };
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

export const addBankNames = async (req: Request, res: Response): Promise<void> => {
    try {
      const {bankName}=req.body ;
      const [success, result] = await addBankNamesInternal(bankName);
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

  export const BankNames = async (req: Request, res: Response): Promise<void> => {
    try {
      const {bankName}=(req as any).query ;
      const [success, result] = await BankNamesInternal(bankName);
      if (success) {
        res.status(200).send({ result, Active: true });
      } else {
        res.status(400).send({ message: result, Active: false });
      }
    } catch (error) {
      console.error("Error in Searching Bank Name:", error);
      res.status(500).json({ error: "An error occurred", Active: false });
    }
  };