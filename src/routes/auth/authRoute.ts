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
  resendverifycode,
  forgotPassotp,
  searchexistingrefercode,
  getlegaldocuments,
  userLoginOTPVerify,
  resendUserverifycode
} from "../../Controller/auth/authControllers";

import {
  allowedRegistrationProperties,
  allowedPropertiesForLoginUser,
  allowedPropertiesForchangepassword,
  allowedPropertiesForforgotpassword,
  allowedPropertiesForVerify,
  allowedPropertiesForsearchexisting,
} from "../../services/allowedProperties";

import {
  registrationValidator,
  handleValidationErrors,
  checkForUnexpectedProperties,
  changepasswordValidator,
  forgotpasswordValidator,
} from "../../services/validators";

const authRouter: Router = Router();

// Routes for User Till login
authRouter.post(
  "/registerbusiness",
  checkForUnexpectedProperties(allowedRegistrationProperties),
  registrationValidator,
  handleValidationErrors,
  register
);
authRouter.post(
  "/verify",
  checkForUnexpectedProperties(allowedPropertiesForVerify),
  verifyEmailAndMobile
);
authRouter.post(
  "/searchexisting",
  checkForUnexpectedProperties(allowedPropertiesForsearchexisting),
  searchExistingController
);
authRouter.post("/searchexistingrefercode", searchexistingrefercode);
authRouter.post("/resendotp", resendOtp);
authRouter.get("/getlegaldocuments", getlegaldocuments);

// Routes for Admin Till login
// authRouter.post(
//   "/registeradmin",
//   checkForUnexpectedProperties(allowedRegistrationProperties),
//   registrationValidator,
//   handleValidationErrors,
//   verifyAdminToken,
//   registerAdmin
// );
// authRouter.post("/loginadmin", loginAdmin);
// authRouter.post("/verifyadmin", adminOTPVerify);


//--------------------------------------- Common route for ADMIN/USER

authRouter.post(
  "/login",
  checkForUnexpectedProperties(allowedPropertiesForLoginUser),
  login
);
authRouter.post(
  "/verifylogin",
  userLoginOTPVerify
); 
authRouter.post("/resendverifycode", resendverifycode);
authRouter.post("/resendverifycodeuser", resendUserverifycode);
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
authRouter.post("/sendforgotpassotp", forgotPassotp);

export default authRouter;
