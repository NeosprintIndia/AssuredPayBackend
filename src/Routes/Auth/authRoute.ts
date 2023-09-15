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
  adminOTPVerify,
  loginAdmin
} from '../../Controller/Auth/authControllers';

//*********************Importing Middleware******************************************************

import VerifyTokenUser from '../../Middlewares/verifyTokenUsers';
import verifyAdminToken from '../../Middlewares/adminTokens';

const authRouter: Router = Router();

//********************* Routes for User Till login**********************************************

authRouter.post('/registerbusiness', register);
authRouter.post('/verify', verifyEmail);
authRouter.post('/login', login);
authRouter.post("/searchexisting",searchExistingController)
authRouter.post('/resendemailotp', resendEmailOtp);
authRouter.post('/change-password', changePass);
authRouter.post('/forgot-password', forgotPass);

//********************************Routes for Admin Till login***************************************
authRouter.post('/registeradmin', verifyAdminToken, registerAdmin);
authRouter.post('/loginadmin',loginAdmin);
authRouter.post('/verifyadmin',adminOTPVerify);


export default authRouter;
