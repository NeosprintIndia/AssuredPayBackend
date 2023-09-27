import { Request, Response } from 'express';
import {
  performRegistration,
  validateUserSignUp,
  authenticateUser,
  changePassword,
  handleForgotPassword,
  registerAdminUser,
  searchExisting,
  resendEmailOtpInternal,
  authenticateAdmin,
  validateMFA,
  handleForgotPasswordAdmin,
  resendverifycodeInternalAdmin,
  forgotPassotpInternal
} from "./authHandler"

import { sendDynamicMail } from "../../services/sendEmail";
import { sendSMS } from "../../services/sendSMS";


// *********************Controller function to handle the registration request***********************
export const register = async (req: Request, res: Response): Promise<void> => {
  const { business_email, username, business_mobile, password, refferal_code } = req.body;
  const [success, result] = await performRegistration(
    business_email,
    username,
    business_mobile,
    password,
    refferal_code
  );
  const reqData = {
    Email_slug:"registration",
    email: business_email,
    VariablesEmail:["Neosprint","Admin"],

    receiverNo:business_mobile,
    Message_slug:"registration",
    VariablesMessage:["Tramo","25"],
  };

  if (success) {
    await sendDynamicMail(reqData);
    console.log("Email sent successfully");
    const sms=await sendSMS(reqData)
    console.log("Message sent successfully",sms);
   
    res.status(200).send({result,Active: true });
  } else {
    res.status(400).send({ message: result, Active: false });
  }
};

//********************* Controller function to handle verify OTP*********************

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  const { business_email, otp } = req.body;

  const [success, result] = await validateUserSignUp(business_email, otp);

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

//********************* Controller function to handle changing the user's /Admin password*********************
export const changePass = async (req: Request, res: Response): Promise<void> => {
  const { username, oldPassword, newPassword } = req.body;
  console.log(username, oldPassword, newPassword)

  const errorMessage = await changePassword(username, oldPassword, newPassword);

  if (errorMessage) {
    res.status(errorMessage === 'Internal server error' ? 500 : errorMessage === 'User not found' ? 404 : 401).json({ message: errorMessage, Active: false });
  } else {
    res.status(200).json({ message: 'Password changed successfully', Active: true });
  }
};

//********************* Controller function to handle forgot password for admin/user request*********************
export const forgotPass = async (req: Request, res: Response): Promise<void> => {
  const { username,otp } = req.body;

  const errorMessage = await handleForgotPassword(username,otp);

  if (errorMessage) {
    res.status(errorMessage === 'Internal server error' ? 500 : 404).json({ message: errorMessage, Active: false });
  } else {
    res.status(200).json({ message: 'Password has been sent to an email', Active: true });
  }
};
//********************* Controller function to handle Existing Search*********************
export async function searchExistingController(req: Request, res: Response) {

  try {
    const { business_email, business_mobile, username } = req.body
    console.log(business_email, business_mobile, username)
    const [success, result] = await searchExisting(business_email, username, business_mobile);

    if (success) {
      res.status(200).send({ result });

    } else {
      res.status(404).send({ error: result });

    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ "message": "Internal Server Error" });
  }
}
//********************* Controller function to handle Resend Mail OTP*********************
export async function resendEmailOtp(req: Request, res: Response) {
  const { email } = req.body;
  const [success, result] = await resendEmailOtpInternal(email)
  if (success) {
    res.status(200).send({ result, Active: true });
  } else {
    res.status(500).send({ result, Active: false });
  }


}


export async function forgotPassotp(req: Request, res: Response) {
  const { username } = req.body;
  const [success, result] = await forgotPassotpInternal(username)
  if (success) {
    res.status(200).send({ result, Active: true });
  } else {
    res.status(500).send({ result, Active: false });
  }


}

//************************************ADMIN*********************************** */


////********************* Controller function to handle registering an admin user*********************
export const registerAdmin = async (req: Request, res: Response): Promise<void> => {
  const { business_email, username, business_mobile, password } = req.body;

  let referral_code: string | null = null;

  if (req.body.refferal_code != null) {
    referral_code = req.body.refferal_code;
  }

  const [success, result] = await registerAdminUser(business_email, username, business_mobile, password, referral_code);

  if (success) {
    res.status(200).send({ result, Active: true });
  } else {
    res.status(400).send({ message: result, Active: false });
  }
};

export const loginAdmin = async (req: Request, res: Response): Promise<void> => {
  const { business_email, password } = req.body;

  const [success, result] = await authenticateAdmin(business_email, password);

  if (success) {
    res.status(200).json({ result, Active: true });
  } else {
    res.status(400).json({ error: result, Active: false });
  }
};

export const adminOTPVerify = async (req: Request, res: Response): Promise<void> => {
  const { business_email, otp } = req.body;

  const [success, result] = await validateMFA(business_email, otp);

  if (success) {
    res.status(200).send({ result, Active: true });
  } else {
    res.status(500).send({ message: result, Active: false });
  }
}; 

export const forgotPassAdmin = async (req: Request, res: Response): Promise<void> => {
  const { username,otp } = req.body;
  const errorMessage = await handleForgotPasswordAdmin(username,otp);

  if (errorMessage) {
    res.status(errorMessage === 'Internal server error' ? 500 : 404).json({ message: errorMessage, Active: false });
  } else {
    res.status(200).json({ message: 'Password has been sent to an email', Active: true });
  }
};

export async function resendverifycode(req: Request, res: Response) {
  const { email } = req.body;
  const [success, result] = await resendverifycodeInternalAdmin(email)
  if (success) {
    res.status(200).send({ result, Active: true });
  } else {
    res.status(500).send({ result, Active: false });
  }


}