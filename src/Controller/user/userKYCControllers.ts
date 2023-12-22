import { Request, Response } from "express";

import {
  getGlobalStatusInternal,
  setGlobalStatusInternal,
  getGSTDetailsInternalsaved,
  verifyPANDetails,
  getGSTDetailsInternal,
  saveGSTDetailsInternal,
  verifyAadharNumberInternal,
  verifyAadharNumberOTPInternal,
  userreferencenumberInternal,
  kycRedoRequestedInternal,
  getRejectedDocumentsInternal,
  getUUIDInternal
} from "./userKYCHandler";


// Route handler function for getting GST details
export const getGSTDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).userId as string;
    const gst = req.body.GSTNumber as string;
    const [success, result] = await getGSTDetailsInternal(gst, userId);
    if (success) {
      res.status(200).send({result,  Active: true,});
    } else {
      res.status(400).send({ message: result, Active: false });
    }
  } catch (error) {
    console.error({ message: "Error in getGSTDetails:", error, Active: false });
    res.status(500).send({ message: "An error occurred", Active: false });
  }
};
//Route handler function to save GST details
export const saveGSTDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    Constitution_of_Business,
    Taxpayer_Type,
    GSTIN_of_the_entity,
    Legal_Name_of_Business,
    Business_PAN,
    Date_of_Registration,
    State,
    Trade_Name,
    Place_of_Business,
    Nature_of_Place_of_Business,
    Nature_of_Business_Activity,
    isGSTDetailSaveManually,
  } = req.body;
  const userId = (req as any).userId;
  const [success, result] = await saveGSTDetailsInternal(
    Constitution_of_Business,
    Taxpayer_Type,
    GSTIN_of_the_entity,
    Legal_Name_of_Business,
    Business_PAN,
    Date_of_Registration,
    State,
    Trade_Name,
    Place_of_Business,
    Nature_of_Place_of_Business,
    Nature_of_Business_Activity,
    userId,
    isGSTDetailSaveManually
  );

  if (success) {
    res.status(200).send({ result, Active_: true });
  } else {
    res.status(400).send({
      message: result,
      Active: false,
    });
  }
};
////Route handler function to retrieve saved GST details
export const getsavedgstdetail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).userId as string;
    const [success, result] = await getGSTDetailsInternalsaved(userId);
    if (success) {
      res.status(200).send({ result, Active: true });
    } else {
      res.status(400).send({ message: result, Active: false });
    }
  } catch (error) {
    console.error("Error in getGSTDetails:", error);
    res.status(500).json({ error: "An error occurred", Active: false });
  }
};
// Route handler function for verifying Aadhar number
export const verifyAadharNumber = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { AadharNumber } = req.body;
    const userId = (req as any).userId as string;
    const [success, result] = await verifyAadharNumberInternal(
      userId,
      AadharNumber
    );
    if (success) {
      res.status(200).send({ leftAttempt: result, Active: true });
    } else {
      res.status(400).send({ leftAttempt: result, Active: false });
    }
  } catch (error) {
    console.error({
      message: "Error in verifyAadharNumber:",error,Active: false,
    });
    res.status(500).json({ error: "An error occurred", Active: false });
  }
};
// Route handler function for verifying Aadhar number OTP
export const verifyAadharNumberOTP = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).userId as string;
    const aadharNum = req.body.aadharNum;
    const otp = req.body.otp as string;
    const [success, results] = await verifyAadharNumberOTPInternal(
      userId,
      aadharNum,
      otp
    );
    if (success) {
      res.status(200).send({ results, Active: true });
    } else {
      res.status(400).send({ message: results, Active: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Wrong Aadhar Number OTP", Active: false });
  }
};
// Route handler function for verifying PAN
export const verifyPAN = async (req: Request, res: Response): Promise<void> => {
  try {
    const PanNumber = req.body.PanNumber as string;
    const id = (req as any).userId as string; 
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
export const userreferencenumber = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = (req as any).userId;
    const{timestamp,latitude,longitude,accuracy}=req.body
    const [success, result] = await userreferencenumberInternal(timestamp,latitude,longitude,accuracy,id );
    if (success) {
      res.status(200).send({ result, Active: true });
    } else {
      res.status(400).send({ message: result, Active: false });
    }
  } catch (error) {
    console.error({
      message: "Error in Generating Reference Number:",
      error,
      Active: false,
    });
    res.status(500).json({ error: "An error occurred", Active: false });
  }
};
export const setglobalstatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { globalStatus } = req.body;
  const userId = (req as any).userId;
  const [success, result] = await setGlobalStatusInternal(globalStatus, userId);
  if (success) {
    res.send({ result, Active: true });
  } else {
    res.status(400).send({
      message: result,
      Active: false,
    });
  }
};
export const getglobalstatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req as any).userId;
  const [success, result] = await getGlobalStatusInternal(userId);
  if (success) {
    res.send({ result, Active: true });
  } else {
    res.status(400).send({
      message: result,
      Active: false,
    });
  }
};
export const kycRedoRequested = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { timestamp,latitude ,longitude,accuracy ,id,key} = req.body;
  const [success, result] = await kycRedoRequestedInternal(timestamp,latitude,longitude,accuracy,id,key);
  if (success) {
    res.send({ result, Active: true });
  } else {
    res.status(500).send({
      message: result,
      Active: false,
    });
  }
};
export const getRejectedDocuments = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = (req as any).userId;
  const [success, result] = await getRejectedDocumentsInternal(id);
  if (success) {
    res.send({ result, Active: true });
  } else {
    res.status(500).send({
      message: result,
      Active: false,
    });
  }
};
export const getUUID = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).userId as string;
    const [success, result] = await getUUIDInternal(userId);
    if (success) {
      res.status(200).send({ result, Active: true });
    } else {
      res.status(400).send({ message: result, Active: false });
    }
  } catch (error) {
    console.error("Error in Get UUID:", error);
    res.status(500).json({ error: "An error occurred", Active: false });
  }
};