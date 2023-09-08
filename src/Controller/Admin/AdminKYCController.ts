import { Request, Response } from 'express';
import {getAllKYCRecordsInternal,approveAdminAadharS1Internal} from '../Admin/AdminKYCHandler';

// Route handler function for retrieving all KYC records
export const getAllKYCRecords = async (req: Request, res: Response): Promise<void> => {
    try {
      // Call the internal function to retrieve all KYC records
      const kycRecords = await getAllKYCRecordsInternal();
      res.json(kycRecords);
    } catch (error) {
      console.error('Error in getAllKYCRecords:', error);
      res.status(500).json({ error: 'An error occurred' });
    }
  };

 // Route handler function for approving Admin Aadhar S1 verification
export const approveAdminAadharS1 = async (req: Request, res: Response): Promise<void> => {
    try {
      const { AdminAadhaarS1Verified, id } = req.body;
  
      // Call the internal function to approve Admin Aadhar S1 verification
      const approvalResult = await approveAdminAadharS1Internal(id, AdminAadhaarS1Verified);
  
      res.json(approvalResult);
    } catch (error) {
      console.error('Error in approveAdminAadharS1:', error);
      res.status(500).json({ error: 'An error occurred' });
    }
  };
   