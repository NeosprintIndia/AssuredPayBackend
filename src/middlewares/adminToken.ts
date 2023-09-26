import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Define a custom Request type with the added userId property
interface CustomRequest extends Request {
  userId?: string; // Adjust the type according to your userId type
}

export default (req: CustomRequest, res: Response, next: NextFunction): void => {
  console.log('In token function');
  try {
    console.log(req.headers.token);
    const token = req.headers.token as string | undefined;

    if (!token) {
      throw new Error('No token provided');
    }

    const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET);

    console.log(decodedToken);
    const role= decodedToken.role
    const userId = decodedToken.userId;
    req.userId = userId;

    

    if (!userId) {
      throw new Error('Invalid user ID');
    } 
    if (role!=="Admin") {
      throw new Error('User is not Admin');
      
    } 
    else {
      next();
    }
    

  } catch (e) {
    res.status(403).json({message:"Unauthorized",Active:false});
  }
};
