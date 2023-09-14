import { Router } from 'express';
import {
  register,
  login,
  verifyEmail,
  changePass,
  forgotPass,
  registerAdmin,
  searchExistingController,
  resendEmailOtp,
} from '../../Controller/Auth/AuthController';

//*********************Importing Middleware******************************************************

import VerifyToken from '../../Middlewares/VerifyTokenUser';
import verifyAdmin from '../../Middlewares/AdminToken';

const authRouter: Router = Router();

//********************* Routes for User Till login**********************************************

authRouter.post('/registerbusiness', register);
authRouter.post('/verify', verifyEmail);
authRouter.post('/login', login);
authRouter.post("/searchexisting",searchExistingController)
authRouter.post('/resendemailotp', resendEmailOtp);
authRouter.post('/change-password', changePass);// Change Password
authRouter.post('/forgot-password', forgotPass);// Forgot Password

//********************************Routes for Admin Till login***************************************
authRouter.post('/registeradmin', [VerifyToken, verifyAdmin], registerAdmin);
authRouter.post('/verifyadmin')


export default authRouter;
