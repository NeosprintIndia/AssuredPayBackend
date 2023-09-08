import { Request, Response } from 'express';
import { verifyPANDetails,getGSTDetailsInternal,verifyAadharNumberInternal,verifyAadharNumberOTPInternal} from '../User/UserKYCHandlers';


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
  
      res.json(gstDetails);
    } catch (error) {
      console.error('Error in getGSTDetails:', error);
      res.status(500).json({ error: 'An error occurred' });
    }
  };  

// Route handler function for verifying Aadhar number
export const verifyAadharNumber = async (req: Request, res: Response): Promise<void> => {
    try {
      // Assuming userId is a string
      const userId = (req as any).userId as string;
  
      // Call the internal function to verify Aadhar number and update reference ID
      const verificationResult = await verifyAadharNumberInternal(userId);
  
      if (typeof verificationResult === 'string') {
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
      const refId = '4027359'; // You can customize refId as needed
  
      // Call the internal function to verify Aadhar number OTP
      const verificationResult = await verifyAadharNumberOTPInternal(userId, otp, refId);
  
      res.json(verificationResult);
    } catch (error) {
      console.error('Error in verifyAadharNumberOTP:', error);
      res.status(500).json({ error: 'An error occurred' });
    }
  };  