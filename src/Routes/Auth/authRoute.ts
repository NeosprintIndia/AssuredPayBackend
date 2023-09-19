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

import {
   allowedRegistrationProperties,
   allowedPropertiesForLogin,
   allowedPropertiesForchangepassword,
   allowedPropertiesForforgotpassword } from '../../Services/AllowedProperties';
import { registrationValidator, 
  handleValidationErrors,
  checkForUnexpectedProperties,
  loginValidator,
  changepasswordValidator,
  forgotpasswordValidator,} from '../../Services/Validators'

//*********************Importing Middleware******************************************************
import verifyAdminToken from '../../Middlewares/adminTokens';

const authRouter: Router = Router();

//********************* Routes for User Till login**********************************************

authRouter.post('/registerbusiness',checkForUnexpectedProperties(allowedRegistrationProperties),registrationValidator,handleValidationErrors,register);
authRouter.post('/verify', verifyEmail); // NO validation Till Service is finalized
authRouter.post('/login', checkForUnexpectedProperties(allowedPropertiesForLogin),loginValidator,handleValidationErrors,login);
authRouter.post("/searchexisting",searchExistingController)
authRouter.post('/resendemailotp', resendEmailOtp); // NO validation till Service is finalized
authRouter.post('/change-password',checkForUnexpectedProperties(allowedPropertiesForchangepassword),changepasswordValidator,handleValidationErrors, changePass);
authRouter.post('/forgot-password',checkForUnexpectedProperties(allowedPropertiesForforgotpassword),forgotpasswordValidator,handleValidationErrors, forgotPass);

//********************************Routes for Admin Till login***************************************
authRouter.post('/registeradmin', verifyAdminToken, registerAdmin);
authRouter.post('/loginadmin',loginAdmin);
authRouter.post('/verifyadmin',adminOTPVerify);


export default authRouter;
