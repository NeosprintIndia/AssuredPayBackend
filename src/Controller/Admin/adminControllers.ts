import { Request, Response } from 'express';
import xlsx from "xlsx"
import {getAllKYCRecordsInternal,approveAdminAadharS1Internal} from './adminHandlers';
import CouponCode from '../../Models/couponCodes';
// Route handler function for retrieving all KYC records
export const getAllKYCRecords = async (req: Request, res: Response): Promise<void> => {
    try {
      // Call the internal function to retrieve all KYC records
      const kycRecords = await getAllKYCRecordsInternal();
      res.json({kycRecords,Active:true});
    } catch (error) {
      console.error('Error in getAllKYCRecords:', error);
      res.status(500).json({ error: 'An error occurred' ,Active:false});
    }
  };

 // Route handler function for approving Admin Aadhar S1 verification
export const approveAdminAadharS1 = async (req: Request, res: Response): Promise<void> => {
    try {
      const { AdminAadhaarS1Verified, id } = req.body;
  
      // Call the internal function to approve Admin Aadhar S1 verification
      const approvalResult = await approveAdminAadharS1Internal(id, AdminAadhaarS1Verified);
  
      res.json({approvalResult,Active:true});
    } catch (error) {
      console.error('Error in approveAdminAadharS1:', error);
      res.status(500).json({ error: 'An error occurred', Active:false });
    }
  };
   
  export const couponCode = async (req: Request, res: Response): Promise<void> => {
    try {
      //const userId = (req as any).userId;     // Use type casting to access userId
      const originalName = (req as any).file.originalname as string;
      const buffer =(req as any).file.buffer as Buffer;

      // Parse the uploaded Excel file
    const workbook = xlsx.read((req as any).file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    console.log(sheetName)
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    // Create an array to store coupon objects
    const coupons = [];

    // Iterate through the sheet data and format it as needed
    sheetData.forEach((row:any) => {
      const coupon = {
        coupon_code: row.coupon_code ? row.coupon_code.trim() : '', // Check if the key exists before trimming
        discountPercentage: row.discountPercentage , // Assuming 'discountPercentage' is a column in the Excel sheet
      };

      coupons.push(coupon);
    });
 console.log(coupons)
    // Insert coupon codes into the database
    await CouponCode.insertMany(coupons);
  
      res.status(200).send('File uploaded successfully');
    } catch (error) {
      console.error('Error in upload:', error);
      res.status(500).send('Internal server error');
    }
  };

  // export const setAllLimits = async (req: Request, res: Response): Promise<void> => {
  //   const { business_email,username,business_mobile, password } = req.body;
  
  //   let referral_code: string | null = null;
  
  //   if (req.body.refferal_code != null) {
  //     referral_code = req.body.refferal_code;
  //   }
  
  //   const [success, result] = await registerAdminUser(business_email, username, business_mobile, password, referral_code);
  
  //   if (success) {
  //     res.send({result,Active:true});
  //   } else {
  //     res.status(400).send({
  //       message: result,Active:false
  //     });
  //   }
  // };