import Registration from "../../models/userRegisterations";
import UserKYC from "../../models/userKYCs";
import Referral from "../../models/refferalCodes";
import globalSetting from "../../models/globalAdminSettings";
import * as CryptoJS from "crypto-js";
import * as jwt from "jsonwebtoken";
import "dotenv/config";
import { generateOTP } from "../../services/otpGenrators";
import { generateReferralCode } from "../../services/referralCodes";
import * as crypto from "crypto";
import { sendDynamicMail } from "../../services/sendEmail";
import { sendSMS } from "../../services/sendSMS";

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

//********************* Handler function to handle Existing Search*********************
export const searchExisting = async (
  business_email: string,
  username: string,
  business_mobile: string
): Promise<boolean | any> => {
  try {
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

    if (Object.keys(searchExist).length === 0) {
      const errorResponse = {
        error: "At least one search parameter is required.",
      };
      return [false, errorResponse];
    }
    const result = await Registration.find(searchExist);

    if (result.length > 0) {
      const finalresult = {
        found: true,
      };
      return [true, finalresult];
    } else {
      const finalresult = {
        found: false,
      };
      return [true, finalresult];
    }
  } catch (error) {
    return [false, error];
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
    const otpGeneratedEmail = await generateOTP();
    const otpGeneratedMobile = await generateOTP();
    const Refer_code = await generateReferralCode(username, business_mobile);
    let updatedReferral = null;
    var referredBy = "";
    if (refferal_code !== null) {
      updatedReferral = await Referral.findOneAndUpdate(
        { refferal_code },
        { $inc: { count: 1 } },
        { new: true }
      );
      if (!updatedReferral) {
        return [false, null];
      }
      const referralUser = updatedReferral.user;
      const referUserProfile = await UserKYC.findOne({ user: referralUser });
      if (referUserProfile) {
        referredBy = (referUserProfile as any).Legal_Name_of_Business;
      }
    }
    const { gstLimit, aadharLimit, panLimit, cin } =
      await globalSetting.findOne({ id: "globalSetting" });

    const newUser = await Registration.create({
      business_email,
      business_mobile,
      password: hashedPassword,
      username,
      oldPasswords: [hashedPassword],
      mobileotp: otpGeneratedMobile,
      emailotp: otpGeneratedEmail,
      refferedBy: referredBy,
      PAN_Attempt: panLimit,
      GST_Attempt: gstLimit,
      Aadhaar_Attempt: aadharLimit,
      cin: cin,
    });

    const Generate_Referral = await Referral.create({
      user: newUser._id,
      refferal_code: Refer_code,
    });
    const reqData = {
      Email_slug: "Verification_OTP",
      email: business_email,
      VariablesEmail: [username, newUser.emailotp],

      receiverNo: business_mobile,
      Message_slug: "Verification_OTP",
      VariablesMessage: [username, newUser.mobileotp],
    };
    await sendDynamicMail(reqData);
    await sendSMS(reqData);

    // In future Frontend doesnt need otp require only id
    return [true, newUser];
  } catch (error) {
    console.error("Error in createUser:", error);
    return [false, error]; // Include the error in the return value
  }
};

// ****************************Function to validate User via OTP****************************
export const validateUserSignUp = async (
  otpVerifyType: string,
  otp: string,
  business_email_or_mobile: string
): Promise<[boolean, string | any]> => {
  let user;

  if (otpVerifyType === "email") {
    user = await Registration.findOneAndUpdate(
      { business_email: business_email_or_mobile, emailotp: otp },
      { $set: { isemailotpverified: true } },
      { new: true }
    );
  } else if (otpVerifyType === "mobile") {
    user = await Registration.findOneAndUpdate(
      { business_mobile: business_email_or_mobile, mobileotp: otp },
      { $set: { ismobileotpverified: true } },
      { new: true }
    );
  } else {
    return [false, "Invalid OTP type"];
  }

  if (!user) {
    return [false, "Invalid OTP"];
  }

  if (user.isemailotpverified && user.ismobileotpverified) {
    await Registration.findOneAndUpdate(
      { business_email: user.business_email },
      { $set: { active: true } },
      { new: true }
    );

    const token = await jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "3D" }
    );

    return [true, token];
  } else {
    return [true, "Verification pending"];
  }
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
    console.log("originalPassword", originalPassword);
    console.log("password", password);

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

export const searchexistingrefercodeInternal = async (
  refercode: string
): Promise<boolean | any> => {
  try {
    const result = await Referral.find({ refferal_code: refercode });
    if (result.length > 0) {
      const finalresult = {
        found: true,
      };
      return [true, finalresult];
    } else {
      const finalresult = {
        found: false,
      };
      return [true, finalresult];
    }
  } catch (error) {
    return [false, error];
  }
};
//*********************Handler function to handle Resend Mail/Mobile OTP*********************


export const resendOtpInternal = async (
  verificationType: string,
  business_email_or_mobile: string
): Promise<[boolean, any]> => {
  try {
    const otpGenerated = await generateOTP();
    let query = {};
    let fieldToUpdate = "";

    if (verificationType === "email") {
      query = { business_email: business_email_or_mobile };
      fieldToUpdate = "emailotp";
      await sendDynamicMail({
        Email_slug: "Verification_OTP",
        email: business_email_or_mobile,
        VariablesEmail: [business_email_or_mobile, otpGenerated],
      });
    } else if (verificationType === "mobile") {
      query = { business_mobile: business_email_or_mobile };
      fieldToUpdate = "mobileotp";
      await sendSMS({
        receiverNo: business_email_or_mobile,
        Message_slug: "Verification_OTP",
        VariablesMessage: [business_email_or_mobile, otpGenerated],
      }); 
      
    } else {
      return [false, "Invalid verification type"];
    }

    const updatedUser = await Registration.findOneAndUpdate(
      query,
      { $set: { [fieldToUpdate]: otpGenerated } },
      { new: true }
    );

    if (updatedUser) {
      return [true, updatedUser];
    } else {
      return [false, "User not found"];
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
      return [false, "Already existing Admin "];
    }

    const newUser = await createAdminUser(
      business_email,
      password,
      business_mobile,
      username,
      refferal_code
    );

    if (!newUser[0]) {
      return [false, "Unable to create new Admin"];
    }

    return [true, newUser];
  } catch (error) {
    console.error("Error in register Admin User:", error);
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
    let updatedReferral: any | null = null;

    if (refferal_code !== null) {
      updatedReferral = await Referral.findOneAndUpdate(
        { refferal_code },
        { $inc: { count: 1 } },
        { new: true }
      );

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

    const Generate_Referral = await Referral.create({
      user: newUser._id,
      refferal_code: Refer_code,
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
    //Send MFA over email
    const reqData = {
      Email_slug: "Verification_OTP",
      email: business_email,
      VariablesEmail: [user.username, user.MFA],

      receiverNo: user.business_mobile,
      Message_slug: "Verification_OTP",
      VariablesMessage: [user.username,  user.MFA],
    };
    await sendDynamicMail(reqData);
    await sendSMS(reqData);

    return [true, updatedUser];
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

export const resendverifycodeInternalAdmin = async (
  business_email: string
): Promise<[boolean, any]> => {
  try {
    const otpGenerated = await generateOTP();
    const updatedUser = await Registration.findOneAndUpdate(
      { business_email: business_email },
      { $set: { MFA: otpGenerated } },
      { new: true }
    );
    const reqData = {
      Email_slug: "Two_step_Verification_OTP",
      email: business_email,
      VariablesEmail: [updatedUser.username, otpGenerated],

      receiverNo: updatedUser.business_mobile,
      Message_slug: "Two_step_Verification_OTP",
      VariablesMessage: [updatedUser.username, otpGenerated],
    };
    await sendDynamicMail(reqData);
    await sendSMS(reqData);
    if (updatedUser) return [true, updatedUser];
    else {
      return [false, updatedUser];
    }
  } catch (error) {
    console.error("Error in Sending OTP:", error);
    return [false, error];
  }
};

// ----------------Common Function to Both ADMIN/USER--------------------------------------


//**************************** Function to handle changing the user/Admin password****************************
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
    const oldPasswords = user.oldPasswords || [];
    const plainOldPasswords = oldPasswords.map((encryptedPassword) => {
      return CryptoJS.AES.decrypt(
        encryptedPassword,
        process.env.PASS_PHRASE
      ).toString(CryptoJS.enc.Utf8);
    });

    let OP = plainOldPasswords[plainOldPasswords.length - 1];
    if (OP != oldPassword) {
      return "Invalid old password";
    }

    if (plainOldPasswords.includes(newPassword)) {
      return "New password cannot be an old password";
    }
    const encryptedNewPassword = CryptoJS.AES.encrypt(
      newPassword,
      process.env.PASS_PHRASE
    ).toString();

    oldPasswords.push(encryptedNewPassword);
    if (oldPasswords.length > 5) {
      oldPasswords.shift();
    }
    user.oldPasswords = oldPasswords;
    user.password = encryptedNewPassword;
    await user.save();
    return null;
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
  username: string,
  otp: string
): Promise<string | null> => {
  try {
    const user = await Registration.findOne({ username: username });

    if (!user) {
      return "User not found";
    }
    if (user.forgotpasswordotp != otp) return "Wrong OTP";

    const tempPassword = generateTemporaryPassword();
  
    const encryptedNewPassword = CryptoJS.AES.encrypt(
      tempPassword,
      process.env.PASS_PHRASE
    ).toString();

    const oldPasswords = user.oldPasswords || [];
    oldPasswords.push(encryptedNewPassword);
    if (oldPasswords.length > 5) {
      oldPasswords.shift();
    }

    user.oldPasswords = oldPasswords;
    user.password = encryptedNewPassword;
    await user.save();
       //Send an email with the temporary password
       const reqData = {
        Email_slug: "Admin_New_Reset",
        email: user.business_email,
        VariablesEmail: [username, tempPassword],
  
        receiverNo: user.business_mobile,
        Message_slug: "Admin_New_Reset",
        VariablesMessage: [username, tempPassword],
      };
      await sendDynamicMail(reqData);
      await sendSMS(reqData);

    return null;
  } catch (error) {
    console.error(error);
    return "Internal server error";
  }
};

// For resending the Forgot Pass OTP Again this route will be called
export const forgotPassotpInternal = async (
  username: string
): Promise<[boolean, any]> => {
  try {
    const otpGenerated = await generateOTP();
    const updatedUser = await Registration.findOneAndUpdate(
      { username: username },
      { $set: { forgotpasswordotp: otpGenerated } },
      { new: true }
    );
    // Send OTP On Mail/Mobile
    const reqData = {
      Email_slug: "Verification_OTP",
      email: updatedUser.business_email,
      VariablesEmail: [updatedUser.username, otpGenerated],

      receiverNo: updatedUser.business_mobile,
      Message_slug: "Verification_OTP",
      VariablesMessage: [otpGenerated],
    };
    await sendDynamicMail(reqData);
    await sendSMS(reqData);

    if (updatedUser) return [true, updatedUser];
    else {
      return [false, updatedUser];
    }
  } catch (error) {
    console.error("Error in Sending OTP:", error);
    return [false, error];
  }
};
