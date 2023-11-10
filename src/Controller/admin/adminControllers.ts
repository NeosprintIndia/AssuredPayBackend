import { Request, Response } from "express";
import {
  getAllKYCRecordsInternal,
  setLimitInternal,
  getAllConfigurationInternal,
  getuserbusinessdetailInternal,
  finalstatusInternal,
  getbusinessrepresentativedetailInternal,
  approveDocumentInternal,
  rejectDocumentInternal,
  getAllActivitiesInternal
  

} from "./adminHandlers";

// Route handler Function to update various limits and settings in the global admin configuration

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
    sellerpaymentRequestDuration,
    sellerfeePercentageRecieveable,
    buyerpaymentRequestDuration,
    buyerfeePercentageRecieveable,
    commissionEligibility,
    refferalCommission
    
  } = req.body;

  const [success, result] = await setLimitInternal(
    gstLimit,
    aadharLimit,
    panLimit,
    cin,
    termsOfService,
    privacyPolicy,
    disclaimer,
    enrollmentFees,
    sellerpaymentRequestDuration,
    sellerfeePercentageRecieveable,
    buyerpaymentRequestDuration,
    buyerfeePercentageRecieveable,
    commissionEligibility,
    refferalCommission
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


// Route handler Function to retrieve all configuration settings from the global admin configuration

export const getconfiguration = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
   
    const [success, result] = await getAllConfigurationInternal();
    if (success) {
      res.status(200).send({result, Active: true} );
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

//Route handler Function to retrieve all KYC records based on sorting

export const getAllKYCRecords = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {due,page,pageSize,search}= (req as any).query 
    const [success, result] = await getAllKYCRecordsInternal(page,pageSize,due,search);
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

//Route handler Function to retrieve business details for a specific user from the UserKYC1 collection in the database

export const getuserbusinessdetail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.query;

  
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

// Route handler Function to retrieve business representative details for a specific user from the UserKYC1 collection in the database
export const getbusinessrepresentativedetail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.query;


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

//Route handler Function to update document approval status in the UserKYC1 collection based on provided parameters

export const approveDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const {_flag,status,id } = req.body;

 
    const [success, result] = await approveDocumentInternal(_flag,status,id);

    if (success) {
      res.status(200).send({Active:true});
    } else {
      res.status(400).send({ message:"Something Went Wrong",Active:false});
    }
  } catch (error) {
    console.error('Error in Approval:', error);
    res.status(500).json({ error: 'An error occurred', Active:false });
  }
};
//Route handler Function to reject a document in the UserKYC1 collection based on provided parameters

export const rejectDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const {filename,status,id,docNameKey,clarification } = req.body;


    const [success, result] = await rejectDocumentInternal(filename,status,id,docNameKey,clarification);

    if (success) {
      res.status(200).send({Active:true});
    } else {
      res.status(400).send({ message:"Something Went Wrong",Active:false});
    }
  } catch (error) {
    console.error('Error in Rejection:', error);
    res.status(500).json({ error: 'An error occurred', Active:false });
  }
};
//Route handler Function to update the due status of a specific user in the UserKYC1 collection in the database

export const finalstatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { key, id } = req.body;

  const [success, result] = await finalstatusInternal(id,key);

  if (success) {
    res.status(200).send({Active:true});
  } else {
    res.status(500).send({
      message: result,
      Active: false,
    });
  }
};


export const allActivities = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {id}= (req as any).query 

   
    const [success, result] = await getAllActivitiesInternal(id);
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

