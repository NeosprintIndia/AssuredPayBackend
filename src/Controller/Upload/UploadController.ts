import { Request, Response } from 'express';
import { handleS1FileUpload,handleS2FileUpload,handlePanFileUpload,handleGSTFileUpload} from '../Upload/UploadHandler';

// Route handler function for uploading Aadhar card
export const uploadAadhars1 = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId; // Use type casting to access userId
    const originalName = (req as any).file.originalname as string;
    const buffer =(req as any).file.buffer as Buffer;

    await handleS1FileUpload(userId, originalName, buffer);

    res.status(200).send('File uploaded successfully');
  } catch (error) {
    console.error('Error in uploadAadhars1:', error);
    res.status(500).send('Internal server error');
  }
};

// Route handler function for uploading Aadhar card
export const uploadAadhars2 = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).userId; // Use type casting to access userId
      const originalName = (req as any).file.originalname as string;
      const buffer =(req as any).file.buffer as Buffer;
  
      await handleS2FileUpload(userId, originalName, buffer);
  
      res.status(200).send('File uploaded successfully');
    } catch (error) {
      console.error('Error in uploadAadhars1:', error);
      res.status(500).send('Internal server error');
    }
  };

  // Route handler function for uploading Aadhar card
export const uploadPan = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).userId; // Use type casting to access userId
      const originalName = (req as any).file.originalname as string;
      const buffer =(req as any).file.buffer as Buffer;
  
      await handlePanFileUpload(userId, originalName, buffer);
  
      res.status(200).send('File uploaded successfully');
    } catch (error) {
      console.error('Error in uploadAadhars1:', error);
      res.status(500).send('Internal server error');
    }
  };

  export const uploadGst = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).userId; // Use type casting to access userId
      const originalName = (req as any).file.originalname as string;
      const buffer =(req as any).file.buffer as Buffer;
  
      await handlePanFileUpload(userId, originalName, buffer);
  
      res.status(200).send('File uploaded successfully');
    } catch (error) {
      console.error('Error in uploadAadhars1:', error);
      res.status(500).send('Internal server error');
    }
  };


