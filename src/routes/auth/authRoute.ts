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
  userLoginOTPVerify
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
  loginValidatorUser,
  changepasswordValidator,
  forgotpasswordValidator,
} from "../../services/validators";

import verifyAdminToken from "../../middlewares/adminTokens";

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
  "/login",
  checkForUnexpectedProperties(allowedPropertiesForLoginUser),
  login
);
authRouter.post(
  "/verifyuserlogin",
  userLoginOTPVerify
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

// Common route for ADMIN/USER
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
