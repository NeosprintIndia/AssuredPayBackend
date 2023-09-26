import { Request, Response } from "express";
import { generateUUID } from "../../services/generateUUID";
import {
  getGlobalStatusInternal,
  getGSTDetailsInternalsaved,
  verifyPANDetails,
  getGSTDetailsInternal,
  saveGSTDetailsInternal,
  verifyAadharNumberInternal,
  verifyAadharNumberOTPInternal,
  saveAadharDetailsInternal,
  userreferencenumberInternal,
} from "./userKYCHandler";

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
    const id = (req as any).userId as string;
    const generatedUUID = await generateUUID();
    const [success, result] = await userreferencenumberInternal(
      id,
      generatedUUID
    );
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
    res.status(500).send({ error: "An error occurred", Active: false });
  }
};

//Route handler function to save GST details
export const saveGSTDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    Constituion_of_Business,
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
    Constituion_of_Business,
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
      message: "Error in verifyAadharNumber:",
      error,
      Active: false,
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
    const otp = req.body.otp as string;

    // Call the internal function to verify Aadhar number OTP
    const [success, result] = await verifyAadharNumberOTPInternal(userId, otp);
    const data = result.body.data;
    const results = {
      aadharNumber: "",
      aadharCO: data.care_of,
      aadharGender: data.gender,
      nameInAadhaar: data.name,
      aadharDOB: data.dob,
      aadharCountry: data.split_address.country,
      distInAadhar: data.split_address.dist,
      aadharHouse: data.split_address.house,
      aadharPincode: data.split_address.pincode,
      aadharPO: data.split_address.po,
      aadharState: data.split_address.state,
      aadharStreet: data.split_address.street,
      aadharSubDistrict: data.split_address.subdist,
      cityInAadhar: data.split_address.vtc,
      addressInAadhar: data.split_address.country,
    };
    const aadharphotoLink = data.photo_link;
    if (success) {
      res.status(200).send({ results, aadharphotoLink, Active: true });
    } else {
      res.status(400).send({ message: results, Active: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Wrong Aadhar Number OTP", Active: false });
  }
};

// Route handler function for saving Aadhar details

export const saveAadharDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    aadharNumber,
    aadharCO,
    aadharGender,
    nameInAadhaar,
    aadharDOB,
    aadharPhotoLink,
    aadharCountry,
    distInAadhar,
    aadharHouse,
    aadharPincode,
    aadharPO,
    aadharState,
    aadharStreet,
    aadharSubDistrict,
    cityInAadhar,
    addressInAadhar,
  } = req.body;
  const userId = (req as any).userId;
  const [success, result] = await saveAadharDetailsInternal(
    aadharNumber,
    aadharCO,
    aadharGender,
    nameInAadhaar,
    aadharDOB,
    aadharPhotoLink,
    aadharCountry,
    distInAadhar,
    aadharHouse,
    aadharPincode,
    aadharPO,
    aadharState,
    aadharStreet,
    aadharSubDistrict,
    cityInAadhar,
    addressInAadhar,
    userId
  );

  if (success) {
    res.status(200).send({ result, Active: true });
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
  const { globalStatus } = req.body;
  const userId = (req as any).userId;
  const [success, result] = await getGlobalStatusInternal(globalStatus, userId);

  if (success) {
    res.send({ result, Active: true });
  } else {
    res.status(400).send({
      message: result,
      Active: false,
    });
  }
};
