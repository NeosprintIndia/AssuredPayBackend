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
  kycRedoRequestedInternal
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
    const inputString = result.GSTresult.body.data.gstin;
    const data = result.GSTresult.body.data;
    const leftAttempt = result.remainingAttempt;
    const pan = inputString.substring(2, inputString.length - 3);
    const results = {
      Constitution_of_Business: data.ctb,
      Taxpayer_Type: data.dty,
      GSTIN_of_the_entity: data.gstin,
      Legal_Name_of_Business: data.lgnm,
      Business_PAN: pan,
      Date_of_Registration: data.rgdt,
      State: data.pradr.addr.stcd,
      Trade_Name: data.lgnm,
      Place_of_Business: `${data.pradr.addr.bno} ${data.pradr.addr.st} ${data.pradr.addr.loc} ${data.pradr.addr.dst} ${data.pradr.addr.pncd}`,
      Nature_of_Place_of_Business: data.pradr.ntr,
      Nature_of_Business_Activity: data.nba[0],
    };

    if (success) {
      res.status(200).send({ results, leftAttempt, Active: true });
    } else {
      res.status(400).send({ message: results, leftAttempt, Active: false });
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
    // Assuming userId is a string
    const userId = (req as any).userId as string;

    // Call the internal function to get GST details
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
    // Assuming userId is a string
    const { AadharNumber } = req.body;
    const userId = (req as any).userId as string;

    // Call the internal function to verify Aadhar number and update reference ID
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
    // Assuming userId is a string
    const userId = (req as any).userId as string;
    const aadharNum = req.body.aadharNum;
    const otp = req.body.otp as string;

    // Call the internal function to verify Aadhar number OTP
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

export const userreferencenumber = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = (req as any).userId;
    const{ip,mac}=req.body
    const [success, result] = await userreferencenumberInternal( id,mac,ip );
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
  const { key, id,mac,ip } = req.body;

  const [success, result] = await kycRedoRequestedInternal(id, key,mac,ip);

  if (success) {
    res.send({ result, Active: true });
  } else {
    res.status(500).send({
      message: result,
      Active: false,
    });
  }
};
