import { Router } from "express";
import {
  register,
  searchExistingController,
  verifyEmailAndMobile,
  resendOtp,
  changePass,
  forgotPass,
  login,
  registerAdmin,
  adminOTPVerify,
  loginAdmin,
  forgotPassAdmin,
  resendverifycode,
  forgotPassotp,
  searchexistingrefercode
  
} from "../../Controller/auth/authControllers";

import {
  allowedRegistrationProperties,
  allowedPropertiesForLogin,
  allowedPropertiesForchangepassword,
  allowedPropertiesForforgotpassword,
} from "../../services/allowedProperties";

import {
  registrationValidator,
  handleValidationErrors,
  checkForUnexpectedProperties,
  loginValidator,
  changepasswordValidator,
  forgotpasswordValidator,
} from "../../services/validators";

//*********************Importing Middleware******************************************************
import verifyAdminToken from "../../middlewares/adminTokens";

const authRouter: Router = Router();

//********************* Routes for User Till login**********************************************

authRouter.post(
  "/registerbusiness",
  checkForUnexpectedProperties(allowedRegistrationProperties),
  registrationValidator,
  handleValidationErrors,
  register
);
authRouter.post("/verify", verifyEmailAndMobile); // NO validation Till Service is finalized

authRouter.post(
  "/login",
  checkForUnexpectedProperties(allowedPropertiesForLogin),
  loginValidator,
  handleValidationErrors,
  login
);
authRouter.post("/searchexisting", searchExistingController);

authRouter.post("/searchexistingrefercode", searchexistingrefercode);

authRouter.post("/resendotp", resendOtp); // NO validation till Service is finalized

authRouter.post(
  "/change-password",
  checkForUnexpectedProperties(allowedPropertiesForchangepassword),
  changepasswordValidator,
  handleValidationErrors,
  changePass
);
authRouter.post(
  "/forgot-password",
  checkForUnexpectedProperties(allowedPropertiesForforgotpassword),
  forgotpasswordValidator,
  handleValidationErrors,
  forgotPass
);
authRouter.post(
  "/sendforgotpassotp", forgotPassotp
);


//********************************Routes for Admin Till login***************************************
authRouter.post(
  "/registeradmin",
  checkForUnexpectedProperties(allowedRegistrationProperties),
  registrationValidator,
  handleValidationErrors,
  verifyAdminToken,
  registerAdmin
);
authRouter.post("/loginadmin", loginAdmin);
authRouter.post("/verifyadmin", adminOTPVerify);
authRouter.post("/resendverifycode", resendverifycode);
authRouter.post("/forgot-passwordadmin", forgotPassAdmin);


export default authRouter;
