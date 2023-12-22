import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Define a custom Request type with the added userId property
interface CustomRequest extends Request {
  userId?: string; // Adjust the type according to your userId type
}

export default (req: CustomRequest, res: Response, next: NextFunction): void => {
  try {
    const token = req.headers.token as string | undefined;
    if (!token) {
      throw new Error('No token provided');
    }
    const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.userId;
    req.userId = userId;
    if ((decodedToken as any).role==="Maker"|| "Checker")
    {
      (req as any).belongsto = decodedToken.belongsTo;
    }
    req.userId = userId;
    if (!userId) {
      throw new Error('Invalid user ID');
    } else {
      next();
    }
  } catch (e) {
    res.sendStatus(403);
  }
};
