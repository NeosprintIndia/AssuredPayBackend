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
} from './userKYCHandler';


// Route handler function for verifying PAN
export const verifyPAN = async (req: Request, res: Response): Promise<void> => {
    try {
      const PanNumber = req.body.PanNumber as string;
      const id = (req as any).userId as string; // Assuming userId is a string
  
      const [success, result] = await verifyPANDetails(PanNumber,id);
  
      if (success) {
        res.status(200).send({result,Active:true});
      } else {
        res.status(400).send({ message: result,Active:false});
      }
    } catch (error) {
      console.error({message:'Error in verifyPAN:', error,Active:false});
      res.status(500).json({ error: 'An error occurred',Active:false });
    }
  };

// Route handler function for getting GST details
export const getGSTDetails = async (req: Request, res: Response): Promise<void> => {
    try {
      // Assuming userId is a string
      const userId = (req as any).userId as string;
      const gst = req.body.GSTNumber as string;
     
  
      // Call the internal function to get GST details
       const [success, result] =await getGSTDetailsInternal(gst)
      const inputString=result.body.data.gstin
      const pan = inputString.substring(2, inputString.length - 3);
      const results={
        "Constituion_of_Business":result.body.data.ctb,
        "Taxpayer_Type": result.body.data.dty,
        "GSTIN_of_the_entity":result.body.data.gstin,
        "Legal_Name_of_Business":result.body.data.lgnm,
        "Business_PAN": pan,
        "Date_of_Registration":result.body.data.rgdt,
        "State":result.body.data.pradr.addr.stcd,
        "Trade_Name":result.body.data.lgnm,
        "Place_of_Business":result.body.data.pradr.addr.bno+" "+result.body.data.pradr.addr.st+" "+result.body.data.pradr.addr.loc+" "+result.body.data.pradr.addr.dst+" "+result.body.data.pradr.addr.pncd,
        "Nature_of_Place_of_Business":result.body.data.pradr.ntr,
        "Nature_of_Business_Activity":result.body.data.nba
      }
    console.log(result)
  
    
      if (success) {
        res.status(200).send({results,Active:true});
      } else {
        res.status(400).send({ message: results,Active:false});
      }

    } catch (error)
     {
      console.error({message:'Error in getGSTDetails:', error,Active:false});
      res.status(500).json({ error: 'An error occurred',Active:false });
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
      res.status(200).send({result,Active_:true});
    } 
    else {
      res.status(400).send({
        message: result,Active:false
      });
    }
  };

   ////Route handler function to retrieve saved GST details

  export const getsavedgstdetail = async (req: Request, res: Response): Promise<void> => {
    try {
      // Assuming userId is a string
      const userId = (req as any).userId as string;
  
      // Call the internal function to get GST details
      const [success, result] = await getGSTDetailsInternalsaved(userId);
      if (success) {
        res.status(200).send({result,Active:true});
      } else {
        res.status(400).send({ message: result,Active:false});
      }
    } catch (error) {
      console.error('Error in getGSTDetails:', error);
      res.status(500).json({ error: 'An error occurred',Active:false });
    }
  };

// Route handler function for verifying Aadhar number
export const verifyAadharNumber = async (req: Request, res: Response): Promise<void> => {
  
    try {
      // Assuming userId is a string
      const{AadharNumber}=req.body
      const userId = (req as any).userId as string;
  
      // Call the internal function to verify Aadhar number and update reference ID
      const [success, result] = await verifyAadharNumberInternal(userId,AadharNumber);
       if (success) {
        res.status(200).send({result,Active:true});
      } else {
        res.status(400).send({ message: result,Active:false});
      }
    } catch (error) {
      console.error({message:'Error in verifyAadharNumber:', error,Active:false});
      res.status(500).json({ error: 'An error occurred',Active:false });
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
      const [success, result] = await verifyAadharNumberOTPInternal(userId, otp);
      const results={
        "aadharNumber":"",
        "aadharCO":result.body.data.care_of,
        "aadharGender":result.body.data.gender,
        "nameInAadhaar":result.body.data.name,
        "aadharDOB": result.body.data.dob,
        "aadharPhotoLink":result.body.data.photo_link,
        "aadharCountry":result.body.data.split_address.country,
        "distInAadhar":result.body.data.split_address.dist,
        "aadharHouse":result.body.data.split_address.house,
        "aadharPincode":result.body.data.split_address.pincode,
        "aadharPO":result.body.data.split_address.po,
        "aadharState":result.body.data.split_address.state,
        "aadharStreet":result.body.data.split_address.street,
        "aadharSubDistrict":result.body.data.split_address.subdist,
        "cityInAadhar":result.body.data.split_address.vtc,
        "addressInAadhar":result.body.data.split_address.country,
      }
      if (success) {
        res.status(200).send({results,Active:true});
      } else {
        res.status(400).send({ message: results,Active:false});
      }
    } catch (error) {
      console.error('Error in verifyAadharNumberOTP:', error);
      res.status(500).json({ error: 'An error occurred',Active:false });
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
      res.status(200).send({result,Active:true});
    } else {
      res.status(400).send({
        message: result,Active:false
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
      res.send({result,Active:true});
    } else {
      res.status(400).send({
        message: result,Active:false
      });
    }
  };

  