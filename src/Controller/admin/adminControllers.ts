import { Request, Response } from "express";
import xlsx from "xlsx";
import {
  getAllKYCRecordsInternal,
  setLimitInternal,
  getAllConfigurationInternal,
  getuserbusinessdetailInternal,
  approvebusinessdetailInternal,
  getbusinessrepresentativedetailInternal,
  approveDocumentInternal,
  rejectDocumentInternal
  //getbusinessdetailInternal,

} from "./adminHandlers";

// Route handler function for retrieving all KYC records
export const getAllKYCRecords = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Call the internal function to retrieve all KYC records
    const [success, result] = await getAllKYCRecordsInternal();
    if (success) {
      res.status(200).send({ result, Active: true });
    } else {
      res.status(400).send({ message: result, Active: false });
    }
  } catch (error) {
    console.error("Error in getAllKYCRecords:", error);
    res.status(500).json({ error: "An error occurred", Active: false });
  }
};

export const setAllLimits = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    gstLimit,
    aadharLimit,
    panLimit,
    cin,
    termsOfService,
    privacyPolicy,
    disclaimer,
    enrollmentFees,
  } = req.body;

  const [success, result] = await setLimitInternal(
    gstLimit,
    aadharLimit,
    panLimit,
    cin,
    termsOfService,
    privacyPolicy,
    disclaimer,
    enrollmentFees
  );

  if (success) {
    res.send({ result, Active: true });
  } else {
    res.status(400).send({
      message: result,
      Active: false,
    });
  }
};

export const getconfiguration = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Call the internal function to retrieve all KYC records
    const [success, result] = await getAllConfigurationInternal();
    if (success) {
      res.send({ result, Active: true });
    } else {
      res.status(400).send({
        message: result,
        Active: false,
      });
    }
  } catch (error) {
    console.error("Error in fetching Configuration:", error);
    res.status(500).json({ error: "An error occurred", Active: false });
  }
};

export const getuserbusinessdetail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.query;

    // Call the internal function to retrieve user KYC records
    const [success, result] = await getuserbusinessdetailInternal(id);
    if (success) {
      res.status(200).send({ result, Active: true });
    } else {
      res.status(400).send({ message: result, Active: false });
    }
  } catch (error) {
    console.error("Error in getting Business Detail:", error);
    res.status(500).json({ error: "An error occurred", Active: false });
  }
};

export const getbusinessrepresentativedetail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.query;

    // Call the internal function to retrieve user KYC records
    const [success, result] = await getbusinessrepresentativedetailInternal(id);
    if (success) {
      res.status(200).send({ result, Active: true });
    } else {
      res.status(400).send({ message: result, Active: false });
    }
  } catch (error) {
    console.error("Error in getting Business Representative Detail:", error);
    res.status(500).json({ error: "An error occurred", Active: false });
  }
};

export const approvebusinessdetail = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { key, id } = req.body;

  // Call the internal function to approve Admin Aadhar S1 verification
  const [success, result] = await approvebusinessdetailInternal(id, key);

  if (success) {
    res.send({ result, Active: true });
  } else {
    res.status(500).send({
      message: result,
      Active: false,
    });
  }
};

export const approveDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const {flag,status,id } = req.body;

    // Call the internal function to approve Admin Aadhar S1 verification
    const [success, result] = await approveDocumentInternal(flag,status,id);

    if (success) {
      res.status(200).send({result,Active:true});
    } else {
      res.status(400).send({ message:result,Active:false});
    }
  } catch (error) {
    console.error('Error in Approval:', error);
    res.status(500).json({ error: 'An error occurred', Active:false });
  }
};

export const rejectDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const {filename,status,id,docNameKey,clarification } = req.body;

    // Call the internal function to approve Admin Aadhar S1 verification
    const [success, result] = await rejectDocumentInternal(filename,status,id,docNameKey,clarification);

    if (success) {
      res.status(200).send({result,Active:true});
    } else {
      res.status(400).send({ message:result,Active:false});
    }
  } catch (error) {
    console.error('Error in Rejection:', error);
    res.status(500).json({ error: 'An error occurred', Active:false });
  }
};