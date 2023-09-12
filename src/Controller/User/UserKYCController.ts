import { Request, Response } from 'express';
import { 
  getGlobalStatusInternal,
  getGSTDetailsInternalsaved,
  verifyPANDetails,
  getGSTDetailsInternal,
  saveGSTDetailsInternal,
  verifyAadharNumberInternal,
  verifyAadharNumberOTPInternal,
  saveAadharDetailsInternal,
} from '../User/UserKYCHandlers';


// Route handler function for verifying PAN
export const verifyPAN = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = (req as any).userId as string; // Assuming userId is a string
  
      const verificationResult = await verifyPANDetails(id);
  
      if (typeof verificationResult === 'string') {
        res.json(verificationResult);
      } else {
        res.json(verificationResult);
      }
    } catch (error) {
      console.error('Error in verifyPAN:', error);
      res.status(500).json({ error: 'An error occurred' });
    }
  };

// Route handler function for getting GST details
export const getGSTDetails = async (req: Request, res: Response): Promise<void> => {
    try {
      // Assuming userId is a string
      const userId = (req as any).userId as string;
      const gst = req.body.GSTNumber as string;
  
      // Call the internal function to get GST details
      const gstDetails = await getGSTDetailsInternal(gst);
      const result={
        "Constituion of Business":gstDetails.body.data.ctb,
        "Taxpayer Type":gstDetails.body.data.dty,
        "GSTIN of the entity":gstDetails.body.data.gstin,
        "Legal Name of Business":gstDetails.body.data.lgnm,
        "Business PAN": " ",
        "Date of Registration":gstDetails.body.data.rgdt,
        "State":gstDetails.body.data.pradr.addr.stcd,
        "Trade Name":gstDetails.body.data.lgnm,
        "Place of Business":gstDetails.body.data.pradr.addr.bno+" "+gstDetails.body.data.pradr.addr.st+" "+gstDetails.body.data.pradr.addr.loc+" "+gstDetails.body.data.pradr.addr.dst+" "+gstDetails.body.data.pradr.addr.pncd,
        "Nature of Place of Business":gstDetails.body.data.pradr.ntr,
        "Nature of Business Activity":gstDetails.body.data.nba
      }
  
      res.json(result);
    } catch (error) {
      console.error('Error in getGSTDetails:', error);
      res.status(500).json({ error: 'An error occurred' });
    }
  };  

  //Route handler function to save GST details
  export const saveGSTDetails = async (req: Request, res: Response): Promise<void> => {
    const { Constituion_of_Business,
      Taxpayer_Type,
      GSTIN_of_the_entity,
      Legal_Name_of_Business,
      Business_PAN,
      Date_of_Registration,
      State,
      Trade_Name,
      Place_of_Business,
      Nature_of_Place_of_Business,
      Nature_of_Business_Activity
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
      userId
      
    );
  
    if (success) {
      res.send(result);
    } else {
      res.status(400).send({
        message: result,
      });
    }
  };

   ////Route handler function to retrieve saved GST details

  export const getsavedgstdetail = async (req: Request, res: Response): Promise<void> => {
    try {
      // Assuming userId is a string
      const userId = (req as any).userId as string;
  
      // Call the internal function to get GST details
      const savedgstDetails = await getGSTDetailsInternalsaved(userId);
  
      res.json(savedgstDetails);
    } catch (error) {
      console.error('Error in getGSTDetails:', error);
      res.status(500).json({ error: 'An error occurred' });
    }
  };

// Route handler function for verifying Aadhar number
export const verifyAadharNumber = async (req: Request, res: Response): Promise<void> => {
  
    try {
      // Assuming userId is a string
      const{AadharNumber}=req.body
      const userId = (req as any).userId as string;
  
      // Call the internal function to verify Aadhar number and update reference ID
      const verificationResult = await verifyAadharNumberInternal(userId,AadharNumber);
       console.log(verificationResult)
      if ( verificationResult ) {
        res.json(verificationResult);
      } else {
        res.json(verificationResult);
      }
    } catch (error) {
      console.error('Error in verifyAadharNumber:', error);
      res.status(500).json({ error: 'An error occurred' });
    }
  };  

// Route handler function for verifying Aadhar number OTP
export const verifyAadharNumberOTP = async (req: Request, res: Response): Promise<void> => {
    try {
      // Assuming userId is a string
      const userId = (req as any).userId as string;
      const otp = req.body.otp as string;
      //findOne()
      //const refId = '4027359'; // You can customize refId as needed
  
      // Call the internal function to verify Aadhar number OTP
      const verificationResult = await verifyAadharNumberOTPInternal(userId, otp);
      const result={
        "aadharNumber":"",
        "aadharCO":verificationResult.body.data.care_of,
        "aadharGender":verificationResult.body.data.gender,
        "nameInAadhaar":verificationResult.body.data.name,
        "aadharDOB": verificationResult.body.data.dob,
        "aadharPhotoLink":verificationResult.body.data.photo_link,
        "aadharCountry":verificationResult.body.data.split_address.country,
        "distInAadhar":verificationResult.body.data.split_address.dist,
        "aadharHouse":verificationResult.body.data.split_address.house,
        "aadharPincode":verificationResult.body.data.split_address.pincode,
        "aadharPO":verificationResult.body.data.split_address.po,
        "aadharState":verificationResult.body.data.split_address.state,
        "aadharStreet":verificationResult.body.data.split_address.street,
        "aadharSubDistrict":verificationResult.body.data.split_address.subdist,
        "cityInAadhar":verificationResult.body.data.split_address.vtc,
        "addressInAadhar":verificationResult.body.data.split_address.country,
      }
  
      res.json(result);
    } catch (error) {
      console.error('Error in verifyAadharNumberOTP:', error);
      res.status(500).json({ error: 'An error occurred' });
    }
  };  
  
  // Route handler function for saving Aadhar details

  export const saveAadharDetails = async (req: Request, res: Response): Promise<void> => {
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
      res.send(result);
    } else {
      res.status(400).send({
        message: result,
      });
    }
  };

 

  export const getglobalstatus = async (req: Request, res: Response): Promise<void> => {
    const {
      globalStatus
      } = req.body;
      const userId = (req as any).userId;
    const [success, result] = await getGlobalStatusInternal(globalStatus,userId);
  
    if (success) {
      res.send(result);
    } else {
      res.status(400).send({
        message: result,
      });
    }
  };

  