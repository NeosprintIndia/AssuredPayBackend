import { Request, Response } from "express";
import {
  performRegistration,
  validateUserSignUp,
  authenticateUser,
  changePassword,
  handleForgotPassword,
  registerAdminUser,
  searchExisting,
  resendOtpInternal,
  authenticateAdmin,
  validateMFA,
  resendverifycodeInternalAdmin,
  forgotPassotpInternal,
  searchexistingrefercodeInternal,
  getlegaldocumentsInternal
  
} from "./authHandler";

import { sendDynamicMail } from "../../services/sendEmail";
import { sendSMS } from "../../services/sendSMS";

// *********************Controller function to handle the registration request***********************
export const register = async (req: Request, res: Response): Promise<void> => {
  const { business_email, username, business_mobile, password, refferal_code,role,} =
    req.body;
  const [success, result] = await performRegistration(
    business_email,
    username,
    business_mobile,
    password,
    refferal_code,
    role
  );
  const reqData = {
    Email_slug: "Business_Succesfully_Registered",
    email: business_email,
    VariablesEmail: [username, "Agent"],

    receiverNo: business_mobile,
    Message_slug: "Business_Succesfully_Registered",
    VariablesMessage: [username, "Agent"],
  };

  if (success) {
    await sendDynamicMail(reqData);
    await sendSMS(reqData);
    const result = { business_email:business_email,business_mobile:business_mobile,username:username };
    res.status(200).send({ result, Active: true });
  } else {
    res.status(400).send({ message: result, Active: false });
  }
};

//********************* Controller function to handle verify OTP*********************

export const verifyEmailAndMobile = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { otpVerifyType, otp, business_email_or_mobile } = req.body;

  const [success, result] = await validateUserSignUp(
    otpVerifyType,
    otp,
    business_email_or_mobile
  );

  if (success) {
    res.status(200).send({ result, Active: true });
  } else {
    res.status(404).send({ message: result, Active: false });
  }
};

// *********************Controller function to handle user login*********************
export const login = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  const [success, result] = await authenticateUser(username, password);

  if (success) {
    res.status(200).send({ result, Active: true });
  } else {
    res.status(400).send({ error: result, Active: false });
  }
};

//********************* Controller function to handle Existing Search*********************
export async function searchExistingController(req: Request, res: Response) {
  try {
    const { 
      //business_email,
       //business_mobile,
        username } = req.body;
  
    const [success, result] = await searchExisting(
      //business_email,
      //business_mobile,
      username,
      
    );

    if (success) {
      res.status(200).send({ result });
    } else {
      res.status(404).send({ error: result });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
}

export async function searchexistingrefercode(req: Request, res: Response) {
  try {
    const { refercode } = req.body;
    const [success, result] = await searchexistingrefercodeInternal(refercode);

    if (success) {
      res.status(200).send({ result });
    } else {
      res.status(404).send({ error: result });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
}
//********************* Controller function to handle Resend Mail OTP*********************
export async function resendOtp(req: Request, res: Response) {
  const { verificationType, business_email_or_mobile } = req.body;
  const [success, result] = await resendOtpInternal(
    verificationType,
    business_email_or_mobile
  );
  if (success) {
    res.status(200).send({ result, Active: true });
  } else {
    res.status(500).send({ result, Active: false });
  }
}

export const getlegaldocuments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
   
    const [success, result] = await getlegaldocumentsInternal();
    if (success) {
      res.status(200).send({result, Active: true} );
    } else {
      res.status(400).send({
        message: result,
        Active: false,
      });
    }
  } catch (error) {
    console.error("Error in fetching Legal Documents:", error);
    res.status(500).json({ error: "An error occurred", Active: false });
  }
};
//************************************ADMIN*********************************** */

////********************* Controller function to handle registering an admin user*********************
export const registerAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { business_email, username, business_mobile, password } = req.body;

  let referral_code: string | null = null;

  if (req.body.refferal_code != null) {
    referral_code = req.body.refferal_code;
  }

  const [success, result] = await registerAdminUser(
    business_email,
    username,
    business_mobile,
    password,
    referral_code
  );

  if (success) {
    res.status(200).send({ result, Active: true });
  } else {
    res.status(400).send({ message: result, Active: false });
  }
};

export const loginAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { business_email, password } = req.body;

  const [success, result] = await authenticateAdmin(business_email, password);

  console.log("IN SUCCESS", result);
  if (success) {
    const results = { business_email: result.business_email };
    res.status(200).json({ results, Active: true });
  } else {
    res.status(400).json({ error: result, Active: false });
  }
};

export const adminOTPVerify = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { business_email, otp } = req.body;

  const [success, result] = await validateMFA(business_email, otp);

  if (success) {
    res.status(200).send({ result, Active: true });
  } else {
    res.status(500).send({ message: result, Active: false });
  }
};

export async function resendverifycode(req: Request, res: Response) {
  const { business_email } = req.body;
  const [success, result] = await resendverifycodeInternalAdmin(business_email);
  if (success) {
    res.status(200).send({ result, Active: true });
  } else {
    res.status(500).send({ result, Active: false });
  }
}

// Common Function for Both ADMIN/USER------------------------------------

//********************* Controller function to handle changing the user's /Admin password*********************
export const changePass = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { username, oldPassword, newPassword } = req.body;
 

  const errorMessage = await changePassword(username, oldPassword, newPassword);

  if (errorMessage) {
    res
      .status(
        errorMessage === "Internal server error"
          ? 500
          : errorMessage === "User not found"
          ? 404
          : 401
      )
      .json({ message: errorMessage, Active: false });
  } else {
    res
      .status(200)
      .json({ message: "Password changed successfully", Active: true });
  }
};

//********************* Controller function to handle forgot password for admin/user request*********************
export const forgotPass = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { username, otp } = req.body;

  const errorMessage = await handleForgotPassword(username, otp);

  if (errorMessage) {
    res
      .status(errorMessage === "Internal server error" ? 500 : 404)
      .json({ message: errorMessage, Active: false });
  } else {
    res
      .status(200)
      .json({ message: "Password has been sent to an email", Active: true });
  }
};

export async function forgotPassotp(req: Request, res: Response) {
  const { username } = req.body;
  const [success, result] = await forgotPassotpInternal(username);
  if (success) {
    res.status(200).send({  Active: true });
  } else {
    res.status(500).send({  Active: false });
  }
}
