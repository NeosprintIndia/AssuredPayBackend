import Registration from "../../Models/userRegisterations";
import UserKYC from "../../Models/userKYCs";
import Referral from "../../Models/refferalCodes";
import * as CryptoJS from "crypto-js";
import * as jwt from "jsonwebtoken";
import "dotenv/config";
import { generateOTP } from "../../Services/otpGenrators";
import { generateReferralCode } from "../../Services/referralCodes";
import { sendMail } from "../../Services/mailTemporarys";
import * as crypto from "crypto";

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
  console.log(isExisting);

  if (isExisting) {
    return [false, "Already existing business or Username"];
  } else {
    const newUser = await createUser(
      business_email,
      password,
      business_mobile,
      username,
      referralCode
    );

    if (!newUser[0]) {
      return [false, "Unable to create new user"];
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
    $and: [{ business_email }, { username }],
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
    const hashedPassword = await CryptoJS.AES.encrypt(
      password,
      process.env.PASS_PHRASE
    ).toString();
    const otpGenerated = await generateOTP();
    const Refer_code = await generateReferralCode(username, business_mobile);
    console.log(Refer_code);

    let updatedReferral = null;
    var referredBy = "";
    if (refferal_code !== null) {
      updatedReferral = await Referral.findOneAndUpdate(
        { refferal_code },
        { $inc: { count: 1 } },
        { new: true }
      );

      console.log("updatedReferral", updatedReferral);
      console.log("updatedReferral.user", updatedReferral.user);
      if (!updatedReferral) {
        return [false, null];
      }
      const referralUser = updatedReferral.user;
      const referUserProfile = await UserKYC.findOne({ user: referralUser });
      console.log("referUserProfile", referUserProfile);
      if (referUserProfile) {
        referredBy = (referUserProfile as any).Legal_Name_of_Business;
      }
    }

    const newUser = await Registration.create({
      business_email,
      business_mobile,
      password: hashedPassword,
      username,
      oldPasswords: [hashedPassword],
      otp: otpGenerated,
      refferedBy: referredBy,
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
export const validateUserSignUp = async (
  business_email: string,
  otp: string
): Promise<[boolean, string | any]> => {
  const user = await Registration.findOne({
    business_email: business_email,
  });

  console.log(user);

  if (!user) {
    return [false, "User not found"];
  }

  if (user.business_email && user.otp !== otp) {
    return [false, "Invalid OTP"];
  }

  const updatedUser = await Registration.findOneAndUpdate(
    { business_email: user.business_email },
    {
      $set: { active: true },
    },
    { new: true }
  );

  return [true, updatedUser];
};

export const authenticateUser = async (
  username: string,
  password: string
): Promise<[boolean, string | any]> => {
  try {
    const user = await Registration.findOne({ username: username });

    if (!user) {
      return [false, "Wrong Credential"];
    }

    const hashedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_PHRASE
    );
    const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);

    if (originalPassword !== password) {
      return [false, "Wrong Password"];
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "3D" }
    );

    return [true, { token: token }];
  } catch (error) {
    return [false, error.message];
  }
};

//**************************** Function to handle changing the user's password****************************
export const changePassword = async (
  username: string,
  oldPassword: string,
  newPassword: string
): Promise<string | null> => {
  try {
    const user = await Registration.findOne({ username: username });

    if (!user) {
      return "User not found";
    }

    // Decrypt all old passwords and check if the oldPassword matches any of them
    const oldPasswords = user.oldPasswords || []; // Ensure oldPasswords is initialized as an array
    const plainOldPasswords = oldPasswords.map((encryptedPassword) => {
      return CryptoJS.AES.decrypt(
        encryptedPassword,
        process.env.PASS_PHRASE
      ).toString(CryptoJS.enc.Utf8);
    });
    console.log("Old password");
    let OP = plainOldPasswords[plainOldPasswords.length - 1];
    if (OP != oldPassword) {
      return "Invalid old password";
    }

    if (plainOldPasswords.includes(newPassword)) {
      return "New password cannot be an old password";
    }

    // Encrypt the new password before saving it
    const encryptedNewPassword = CryptoJS.AES.encrypt(
      newPassword,
      process.env.PASS_PHRASE
    ).toString();

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
    return "Internal server error";
  }
};

//********************* Handler function to Generate Temp Password*********************
function generateTemporaryPassword(): string {
  return crypto.randomBytes(8).toString("hex"); // 16 characters long hexadecimal string
}

//**************************** Function to handle forgot password logic****************************
export const handleForgotPassword = async (
  username: string
): Promise<string | null> => {
  try {
    // Check if the user exists in the database
    const user = await Registration.findOne({ username: username });

    if (!user) {
      return "User not found";
    }

    // Generate a temporary password
    const tempPassword = generateTemporaryPassword();
    const encryptedNewPassword = CryptoJS.AES.encrypt(
      tempPassword,
      process.env.PASS_PHRASE
    ).toString();
    console.log(tempPassword);

    // Update the user's password in the database
    const oldPasswords = user.oldPasswords || [];
    oldPasswords.push(encryptedNewPassword);
    if (oldPasswords.length > 5) {
      oldPasswords.shift(); // Remove the oldest password
    }

    // Update the user's oldPasswords field and save the user
    user.oldPasswords = oldPasswords;
    user.password = encryptedNewPassword;
    await user.save();

    // Send an email with the temporary password
    await sendMail({
      to: user.business_email,
      OTP: tempPassword,
    });

    return null; // Password reset successful
  } catch (error) {
    console.error(error);
    return "Internal server error";
  }
};
//********************* Handler function to handle Existing Search*********************
export const searchExisting = async (
  business_email: string,
  username: string,
  business_mobile: string
): Promise<boolean | any> => {
  try {
    console.log(business_email, username, business_mobile);
    const searchExist = {};
    if (business_email !== undefined) {
      (searchExist as any).business_email = business_email;
    }

    if (username !== undefined) {
      (searchExist as any).username = username;
    }

    if (business_mobile !== undefined) {
      (searchExist as any).business_mobile = business_mobile;
    }
    const result = await Registration.find(searchExist);

    console.log(result);

    if (result.length > 0) {
      const finalresult = {
        found: true,
        data: result,
      };
      return [true,finalresult];
    } else {
      const finalresult = {
        found: false,
        data: result,   
      };
      return [true,finalresult];
    }
  } catch (error) {
    return error;
  }
};

//*********************Handler function to handle Resend Mail OTP*********************
export const resendEmailOtpInternal = async (
  email: string
): Promise<[boolean, any]> => {
  try {
    const otpGenerated = await generateOTP();
    const updatedUser = await Registration.findOneAndUpdate(
      { business_email: email },
      { $set: { otp: otpGenerated } },
      { new: true }
    );
    console.log(updatedUser);
    if (updatedUser) return [true, updatedUser];
    else {
      return [false, updatedUser];
    }
  } catch (error) {
    console.error("Error in Sending OTP:", error);
    return [false, error];
  }
};
//****************************Admin Access Starts*****************************************
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
      return [false, "Already existing business or Username"];
    }

    const newUser = await createAdminUser(
      business_email,
      password,
      business_mobile,
      username,
      refferal_code
    );

    if (!newUser[0]) {
      return [false, "Unable to create new user"];
    }

    return [true, newUser];
  } catch (error) {
    console.error("Error in registerAdminUser:", error);
    return [false, "Unable to sign up, please try again later"];
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
    const hashedPassword = await CryptoJS.AES.encrypt(
      password,
      process.env.PASS_PHRASE
    ).toString();
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
    return [false, "Unable to sign up, please try again later"];
  }
};

export const authenticateAdmin = async (
  business_email: string,
  password: string
): Promise<[boolean, string | any]> => {
  try {
    const user = await Registration.findOne({ business_email });

    if (!user) {
      return [false, "Wrong Credential"];
    }

    const hashedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_PHRASE
    );
    const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);

    if (originalPassword !== password) {
      return [false, "Wrong Password"];
    }
    const otpGenerated = await generateOTP();
    const updatedUser = await Registration.findOneAndUpdate(
      { business_email: business_email },
      {
        $set: { MFA: otpGenerated },
      },
      { new: true }
    );

    await sendMail({
      to: user.business_email,
      otp: otpGenerated,
    });

    return [true, { updatedUser }];
  } catch (error) {
    return [false, error.message];
  }
};

export const validateMFA = async (
  business_email: string,
  otp: string
): Promise<[boolean, string | any]> => {
  const user = await Registration.findOne({
    business_email: business_email,
  });

  console.log(user);

  if (!user) {
    return [false, "User not found"];
  }

  if (user.business_email && user.MFA !== otp) {
    return [false, "Invalid OTP"];
  }
  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "3D" }
  );

  return [true, { token: token }];
};
