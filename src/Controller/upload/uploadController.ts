import { Request, Response } from 'express';
import {  handledocsInternal} from './uploadHandler';

 export const uploaddoc = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).userId; // Use type casting to access userId
      const originalName = (req as any).file.originalname as string;
      const buffer =(req as any).file.buffer as Buffer;
      const {filename}=req.query

      console.log("FILENAME")
    
  
      await handledocsInternal(userId, originalName, buffer,filename);
  
      res.status(200).send({message:'File uploaded successfully',Active:true});
    } catch (error) {
      console.error({message:'Error in upload Document', error,Active:false});
      res.status(500).send({message:'Internal server error',Active:false});
    }
  };



