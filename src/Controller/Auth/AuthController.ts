import { Request, Response } from 'express';
import { performRegistration, validateUserSignUp, authenticateUser, changePassword, handleForgotPassword, registerAdminUser } from './AuthHandlers'


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

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  const { business_email, otp } = req.body;

  const user = await validateUserSignUp(business_email, otp);

  res.send(user);
};

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


// Controller function to handle registering an admin user
export const registerAdmin = async (req: Request, res: Response): Promise<void> => {
  const { business_email, username, business_mobile, password } = req.body;

  let referral_code: string | null = null;

<<<<<<< Updated upstream
  if (req.body.refferal_code != null) {
=======
  if (req.body.refferal_code !== null) {
>>>>>>> Stashed changes
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
