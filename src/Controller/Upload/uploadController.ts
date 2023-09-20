import { Request, Response } from 'express';
import { handleS1FileUpload,handleS2FileUpload,handlePanFileUpload,handleGSTFileUpload,handledocsInternal} from './uploadHandler';

//**************************** Route handler function for uploading Aadhar card****************************
export const uploadAadhars1 = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId; // Use type casting to access userId
    const originalName = (req as any).file.originalname as string;
    const buffer =(req as any).file.buffer as Buffer;

    await handleS1FileUpload(userId, originalName, buffer);

    res.status(200).send({message:'File uploaded successfully',Active:true});
  } catch (error) {
    console.error({message:'Error in uploadAadhars1:', error,Active:false});
    res.status(500).send({message:'Internal server error',Active:false});
  }
};

// ****************************Route handler function for uploading Aadhar card****************************
export const uploadAadhars2 = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).userId; // Use type casting to access userId
      const originalName = (req as any).file.originalname as string;
      const buffer =(req as any).file.buffer as Buffer;
  
      await handleS2FileUpload(userId, originalName, buffer);
  
      res.status(200).send({message:'File uploaded successfully',Active:true});
    } catch (error) {
      console.error({message:'Error in uploadAadhars2:', error,Active:false});
      res.status(500).send({message:'Internal server error',Active:false});
    }
  };

  // ****************************Route handler function for uploading Aadhar card****************************
export const uploadPan = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).userId; // Use type casting to access userId
      const originalName = (req as any).file.originalname as string;
      const buffer =(req as any).file.buffer as Buffer;
  
      await handlePanFileUpload(userId, originalName, buffer);
  
      res.status(200).send({message:'File uploaded successfully',Active:true});
    } catch (error) {
      console.error({message:'Error in upload Pan:', error,Active:false});
      res.status(500).send({message:'Internal server error',Active:false});
    }
  };

  export const uploadGst = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).userId; // Use type casting to access userId
      const originalName = (req as any).file.originalname as string;
      const buffer =(req as any).file.buffer as Buffer;
  
      await handleGSTFileUpload(userId, originalName, buffer);
  
      res.status(200).send({message:'File uploaded successfully',Active:true});
    } catch (error) {
      console.error({message:'Error in upload GST:', error,Active:false});
      res.status(500).send({message:'Internal server error',Active:false});
    }
  };

  export const uploaddoc = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).userId; // Use type casting to access userId
      const originalName = (req as any).file.originalname as string;
      const buffer =(req as any).file.buffer as Buffer;
      const {filename}=req.query
      console.log(filename)
  
      await handledocsInternal(userId, originalName, buffer,filename);
  
      res.status(200).send({message:'File uploaded successfully',Active:true});
    } catch (error) {
      console.error({message:'Error in upload Document', error,Active:false});
      res.status(500).send({message:'Internal server error',Active:false});
    }
  };



