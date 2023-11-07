import { Request, Response } from 'express';
import {
  findAndInsert,
  find,
  findAndUpdate,
  verifyPANDetails,
  getGSTDetailsInternal
  
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
export const getGSTDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).userId as string;
    const gst = req.body.GSTNumber as string;
    const [success,result] = await getGSTDetailsInternal(gst, userId);
    console.log("RESULT",result)
    const inputString = result.body.data.gstin;
    const data = result.body.data;
    const pan = inputString.substring(2, inputString.length - 3);
    const results = {
      constituionOfBusiness: data.ctb,
      taxpayerType: data.dty,
      legalNameOfBusiness: data.lgnm,
      businessPanNumber: pan,
      gstDateOfRegistraion: data.rgdt,
      state: data.pradr.addr.stcd,
      tradeName: data.lgnm,
      placeOfBusiness: `${data.pradr.addr.bno} ${data.pradr.addr.st} ${data.pradr.addr.loc} ${data.pradr.addr.dst} ${data.pradr.addr.pncd}`,
      natureOfPlaceofBusiness: data.pradr.ntr,
      natureOFBusinessActivity: data.nba[0],
       //GSTIN_of_the_entity: data.gstin,
    };

    if (success) {
      res.status(200).send({ results, Active: true });
    } else {
      res.status(400).send({ message:results, Active: false });
    }
  } catch (error) {
    console.error({ message: "Error in getGSTDetails:", error, Active: false });
    res.status(500).send({ message: "An error occurred", Active: false });
  }
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
