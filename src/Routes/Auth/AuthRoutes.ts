import { Router } from 'express';
import {
  register,
  login,
  verifyEmail,
  changePass,
  forgotPass,
  registerAdmin,
  searchExistingController,
} from '../../Controller/Auth/AuthController';

//Importing Middleware

import VerifyToken from '../../Middlewares/VerifyTokenUser';
import verifyAdmin from '../../Middlewares/AdminToken';

const authRouter: Router = Router();

// Routes for User Till login

authRouter.post('/registerbusiness', register);
authRouter.post('/verify', verifyEmail);
authRouter.post('/login', login);
authRouter.post("/searchexisting",searchExistingController)

// Change Password
authRouter.post('/change-password', changePass);
// Forgot Password
authRouter.post('/forgot-password', forgotPass);

//Routes for Admin 

authRouter.post('/registeradmin', [VerifyToken, verifyAdmin], registerAdmin);

export default authRouter;
