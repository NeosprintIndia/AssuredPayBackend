import Registration from '../../Models/UserRegister';
import Referral from "../../Models/RefferalCode";
import * as CryptoJS from "crypto-js";
import * as jwt from 'jsonwebtoken';
import "dotenv/config";
import { generateOTP } from '../../Services/OtpGen';
import { generateReferralCode } from "../../Services/referral_code";
import { sendMail } from '../../Services/MailTemp';
import * as crypto from 'crypto';

// ****************************Function to handle registration logic****************************
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


// **********************Function to handle Exisitng User during registration************************
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

// ****************************Function to validate User via OTP****************************
export const validateUserSignUp = async (business_email: string, otp: string): Promise<[boolean, string | any]> => {
  const user = await Registration.findOne({
    business_email:business_email
  });

  console.log(user)

  if (!user) {
    return [false, 'User not found'];
  }

  if (user.business_email && user.otp !== otp) {
    return [false, 'Invalid OTP'];
  }

  const updatedUser = await Registration.findOneAndUpdate({business_email:user.business_email}, {
    $set: { active: true }
   
  }, { new: true });

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

//**************************** Function to handle changing the user's password****************************
export const changePassword = async (business_email: string, oldPassword: string, newPassword: string): Promise<string | null> => {
  try {
    const user = await Registration.findOne({ business_email: business_email });

    if (!user) {
      return 'User not found';
    }

    // Decrypt all old passwords and check if the oldPassword matches any of them
    const oldPasswords = user.oldPasswords || []; // Ensure oldPasswords is initialized as an array
    const plainOldPasswords = oldPasswords.map((encryptedPassword) => {
      return CryptoJS.AES.decrypt(encryptedPassword, process.env.PASS_PHRASE).toString(CryptoJS.enc.Utf8);
    });

    if (!plainOldPasswords.includes(oldPassword)) {
      return 'Invalid old password';
    }

    if (plainOldPasswords.includes(newPassword)) {
      return 'New password cannot be an old password';
    }

    // Encrypt the new password before saving it
    const encryptedNewPassword = CryptoJS.AES.encrypt(newPassword, process.env.PASS_PHRASE).toString();
    
    // Add the new password to the oldPasswords array and limit it to the 5 latest passwords
    oldPasswords.push(encryptedNewPassword);
    if (oldPasswords.length > 5) {
      oldPasswords.shift(); // Remove the oldest password
    }

    // Update the user's oldPasswords field and save the user
    user.oldPasswords = oldPasswords;
    await user.save();

    return null; // Password changed successfully
  } catch (error) {
    return 'Internal server error';
  }
};

 //********************* Handler function to Generate Temp Password********************* 
function generateTemporaryPassword(): string {
  return crypto.randomBytes(8).toString('hex'); // 16 characters long hexadecimal string
}


//**************************** Function to handle forgot password logic****************************
export const handleForgotPassword = async (business_email: string): Promise<string | null> => {
  try {
    // Check if the user exists in the database
    const user = await Registration.findOne({ business_email: business_email });

    if (!user) {
      return 'User not found';
    }

    // Generate a temporary password
    const tempPassword = generateTemporaryPassword();
    const encryptedNewPassword = CryptoJS.AES.encrypt(tempPassword, process.env.PASS_PHRASE).toString();
    console.log(tempPassword)

    // Update the user's password in the database
    user.oldPasswords.push(encryptedNewPassword);
    user.password = encryptedNewPassword;
    await user.save();

    // Send an email with the temporary password
    await sendMail({
      to: business_email,
      OTP: tempPassword,
    });

    return null; // Password reset successful
  } catch (error) {
    console.error(error);
    return 'Internal server error';
  }
}
 //********************* Handler function to handle Existing Search********************* 
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
          {username },
          { business_mobile }
        ]
      });
  
      console.log(result);
     
  
      if (result.length > 0) {
        const finalresult={
          "found":true,
          "data":result
        }
       return finalresult
      } else {
        const finalresult={
          "found":false,
          "data":result
        }
       return finalresult
      }
    } catch (error) {
      return error
    }
  };

 //*********************Handler function to handle Resend Mail OTP*********************
 export const resendEmailOtpInternal= async(email:string): Promise<[boolean, any]> => {
  try {
    const otpGenerated = await generateOTP();
    const updatedUser = await Registration.findOneAndUpdate({business_email:email}, {
      $set: { otp: otpGenerated },
      
    },{ new: true } ); 
    return [true, updatedUser];
  } catch (error) {
    console.error("Error in Sending OTP:", error);
    return [false,"Error"];
  }

 }

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

export const authenticateAdmin = async (business_email: string, password: string): Promise<[boolean, string | any]> => {
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
    const otpGenerated = await generateOTP();
    const updatedUser = await Registration.findOneAndUpdate({business_email:business_email}, {
      $set: { otp: otpGenerated },
      
    },{ new: true } ); 

    //const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '3D' });

    return [true, { updatedUser }];
  } catch (error) {
    return [false, error.message];
  }
};

export const validateAdminLogin = async (business_email: string, otp: string): Promise<[boolean, string | any]> => {
  const user = await Registration.findOne({
    business_email:business_email
  });

  console.log(user)

  if (!user) {
    return [false, 'User not found'];
  }

  if (user.business_email && user.otp !== otp) {
    return [false, 'Invalid OTP'];
  }

  return [true, user];
};



