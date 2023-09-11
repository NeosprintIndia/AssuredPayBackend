import { Request, Response } from 'express';
import { performRegistration, validateUserSignUp, authenticateUser, changePassword, handleForgotPassword, registerAdminUser ,searchExisting} from './AuthHandlers'


// Controller function to handle the registration request
export const register = async (req: Request, res: Response): Promise<void> => {
  const { business_email, username, business_mobile, password, refferal_code } = req.body;

  const [success, result] = await performRegistration(
    business_email,
    username,
    business_mobile,
    password,
    refferal_code
  );

  if (success) {
    res.send(result);
  } else {
    res.status(400).send({
      message: result,
    });
  }
};


// Controller function to handle verify OTP

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  const { business_email, otp } = req.body;

  const user = await validateUserSignUp(business_email, otp);

  res.send(user);
};

// export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
//   const { _id, otp } = req.body;

//   const user = await validateUserSignUp(_id, otp);

//   res.send(user);
// };

// Controller function to handle user login
export const login = async (req: Request, res: Response): Promise<void> => {
  const { business_email, password } = req.body;

  const [success, result] = await authenticateUser(business_email, password);

  if (success) {
    res.status(200).json(result);
  } else {
    res.status(400).json({ error: result });
  }
};

// Controller function to handle changing the user's password
export const changePass = async (req: Request, res: Response): Promise<void> => {
  const { business_email, oldPassword, newPassword } = req.body;

  const errorMessage = await changePassword(business_email, oldPassword, newPassword);

  if (errorMessage) {
    res.status(errorMessage === 'Internal server error' ? 500 : errorMessage === 'User not found' ? 404 : 401).json({ message: errorMessage });
  } else {
    res.status(200).json({ message: 'Password changed successfully' });
  }
};

// Controller function to handle forgot password request
export const forgotPass = async (req: Request, res: Response): Promise<void> => {
  const email = req.body.business_email;

  const errorMessage = await handleForgotPassword(email);

  if (errorMessage) {
    res.status(errorMessage === 'Internal server error' ? 500 : 404).json({ message: errorMessage });
  } else {
    res.status(200).json({ message: 'Password has been sent to an email' });
  }
};

export async function searchExistingController(req: Request, res: Response) {

  try {
    const{business_email,business_mobile,username}=req.body
    console.log(business_email,business_mobile,username)
    const result =await searchExisting(business_email,username,business_mobile);
    
    if (result) {
      res.status(200).json();
      
    } else {
      res.status(404).json({error: result});
      
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ "message": "Internal Server Error" });
  }
}


// Controller function to handle registering an admin user
export const registerAdmin = async (req: Request, res: Response): Promise<void> => {
  const { business_email, username, business_mobile, password } = req.body;

  let referral_code: string | null = null;

  if (req.body.refferal_code != null) {
    referral_code = req.body.refferal_code;
  }

  const [success, result] = await registerAdminUser(business_email, username, business_mobile, password, referral_code);

  if (success) {
    res.send(result);
  } else {
    res.status(400).send({
      message: result,
    });
  }
};

