import Registration from '../../Models/UserRegister';
import Referral from "../../Models/RefferalCode";
import * as CryptoJS from "crypto-js";
import * as jwt from 'jsonwebtoken';
import "dotenv/config";
import { generateOTP } from '../../Services/OtpGen';
import { generateReferralCode } from "../../Services/referral_code";
import { sendMail } from '../../Services/MailTemp';
import * as crypto from 'crypto';

// Function to handle registration logic
export const performRegistration = async (
  business_email: string,
  username: string,
  business_mobile: string,
  password: string,
  refferal_code: string | null
): Promise<[boolean, any]> => {
  let referralCode: string | null = null;

  if (refferal_code != null) {
    referralCode = refferal_code;
  }

  const isExisting = await findUserByEmailUsername(business_email, username);

  if (isExisting) {
    return [false, 'Already existing business or Username'];
  } else {
    const newUser = await createUser(business_email, password, business_mobile, username, referralCode);

    if (!newUser[0]) {
      return [false, 'Unable to create new user'];
    } else {
      return [true, newUser];
    }
  }
};
const findUserByEmailUsername = async (
  business_email: string,
  username: string
): Promise<boolean | any> => {
  const user = await Registration.findOne({
    $and: [
      { business_email },
      { username },
    ],
  });
  if (!user) {
    return false;
  }
  return user;
};

const createUser = async (
  business_email: string,
  password: string,
  business_mobile: string,
  username: string,
  refferal_code: string | null
): Promise<[boolean, any]> => {
  try {
    const hashedPassword = await CryptoJS.AES.encrypt(password, process.env.PASS_PHRASE).toString();
    const otpGenerated = await generateOTP();
    const Refer_code = await generateReferralCode(username, business_mobile);
    console.log(Refer_code);

    let updatedReferral = null;

    if (refferal_code !== null) {
      updatedReferral = await Referral.findOneAndUpdate(
        { refferal_code },
        { $inc: { count: 1 } },
        { new: true }
      );
      console.log(updatedReferral);
      if (!updatedReferral) {
        return [false, null];
      }
    }

    const newUser = await Registration.create({
      business_email,
      business_mobile,
      password: hashedPassword,
      username,
      oldPasswords: [hashedPassword],
      otp: otpGenerated,
    });
    console.log(newUser);

    const Generate_Referral = await Referral.create({
      user: newUser._id,
      refferal_code: Refer_code,
    });
    console.log(Generate_Referral);

    await sendMail({
      to: business_email,
      OTP: otpGenerated,
    });
// In future Frontend doesnt need otp require only id
console.log(newUser);
    return [true, newUser];
  } catch (error) {
    console.error("Error in createUser:", error);
    return [false, error]; // Include the error in the return value
  }
};


export const validateUserSignUp = async (business_email: string, otp: string): Promise<[boolean, string | any]> => {
  const user = await Registration.findOne({
    business_email,
  });

  if (!user) {
    return [false, 'User not found'];
  }

  if (user.business_email && user.otp !== otp) {
    return [false, 'Invalid OTP'];
  }

  const updatedUser = await Registration.findByIdAndUpdate(user.business_email, {
    $set: { active: true },
  });

  return [true, updatedUser];
};

export const authenticateUser = async (business_email: string, password: string): Promise<[boolean, string | any]> => {
  try {
    const user = await Registration.findOne({ business_email });

    if (!user) {
      return [false, 'Wrong Credential'];
    }

    const hashedPassword = CryptoJS.AES.decrypt(user.password, process.env.PASS_PHRASE);
    const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);

    if (originalPassword !== password) {
      return [false, 'Wrong Password'];
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '3D' });

    return [true, { token, user }];
  } catch (error) {
    return [false, error.message];
  }
};

// Function to handle changing the user's password
export const changePassword = async (business_email: string, oldPassword: string, newPassword: string): Promise<string | null> => {
  try {
    const user = await Registration.findOne({ business_email });

    if (!user) {
      return 'User not found';
    }

    if (!user.comparePassword(oldPassword)) {
      return 'Invalid old password';
    }

    if (user.oldPasswords.includes(newPassword)) {
      return 'New password cannot be an old password';
    }

    user.oldPasswords.push(user.password);
    user.password = newPassword;
    await user.save();

    return null; // Password changed successfully
  } catch (error) {
    return 'Internal server error';
  }
};


function generateTemporaryPassword(): string {
  return crypto.randomBytes(8).toString('hex'); // 16 characters long hexadecimal string
}


// Function to handle forgot password logic
export const handleForgotPassword = async (email: string): Promise<string | null> => {
  try {
    // Check if the user exists in the database
    const user = await Registration.findOne({ business_email: email });

    if (!user) {
      return 'User not found';
    }

    // Generate a temporary password
    const tempPassword = generateTemporaryPassword();

    // Update the user's password in the database
    user.oldPasswords.push(tempPassword);
    user.password = tempPassword;
    await user.save();

    // Send an email with the temporary password
    await sendMail({
      to: email,
      OTP: tempPassword,
    });

    return null; // Password reset successful
  } catch (error) {
    console.error(error);
    return 'Internal server error';
  }
}
  
export const searchExisting = async (
  business_email: string,
  username: string,
  business_mobile:string
): Promise<boolean | any> => {
    try {
      console.log(business_email,username,business_mobile)
      const result = await Registration.find({
        $or: [
          { business_email },
          { business_mobile },
          { username }
        ]
      });
  
      console.log(result);
  
      if (result.length > 0) {
       return true
      } else {
       return false
      }
    } catch (error) {
      return error
    }
  };

  export const registerAdminUser = async (
    business_email: string,
    username: string,
    business_mobile: string,
    password: string,
    refferal_code: string | null
  ): Promise<[boolean, any]> => {
    try {
      const isExisting = await findUserByEmailUsername(business_email, username);
  
      if (isExisting) {
        return [false, 'Already existing business or Username'];
      }
  
      const newUser = await createAdminUser(business_email, password, business_mobile, username, refferal_code);
  
      if (!newUser[0]) {
        return [false, 'Unable to create new user'];
      }
  
      return [true, newUser];
    } catch (error) {
      console.error('Error in registerAdminUser:', error);
      return [false, 'Unable to sign up, please try again later'];
    }
  };
  
  const createAdminUser = async (
    business_email: string,
    password: string,
    business_mobile: string,
    username: string,
    refferal_code: string | null
  ): Promise<[boolean, any | any]> => {
    try {
      const hashedPassword = await CryptoJS.AES.encrypt(password, process.env.PASS_PHRASE).toString();
      const otpGenerated = await generateOTP();
      const Refer_code = await generateReferralCode(username, business_mobile);
      console.log(Refer_code);
  
      let updatedReferral: any | null = null;
  
      if (refferal_code !== null) {
        updatedReferral = await Referral.findOneAndUpdate(
          { refferal_code },
          { $inc: { count: 1 } },
          { new: true }
        );
        console.log(updatedReferral);
        if (!updatedReferral) {
          return [false, null];
        }
      }
  
      const newUser = await Registration.create({
        business_email,
        business_mobile,
        password: hashedPassword,
        username,
        oldPasswords: [hashedPassword],
        otp: otpGenerated,
        role: "Admin",
      });
      console.log(newUser);
  
      const Generate_Referral = await Referral.create({
        user: newUser._id,
        refferal_code: Refer_code,
      });
      console.log(Generate_Referral);
  
      await sendMail({
        to: business_email,
        OTP: otpGenerated,
      });
      return [true, newUser];
    } catch (error) {
      console.error("Error in createAdminUser:", error);
      return [false, 'Unable to sign up, please try again later'];
    }
  };




