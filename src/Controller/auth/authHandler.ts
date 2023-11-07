import Registration from "../../models/userRegisterations";
import businessUser from "../../models/businessUser";
import UserKYC from "../../models/userKYCs";
import subUsers from "../../models/subUsers";
import Referral from "../../models/refferalCodes";
import globalSetting from "../../models/globalAdminSettings";
import * as CryptoJS from "crypto-js";
import * as jwt from "jsonwebtoken";
import "dotenv/config";
import { generateOTP } from "../../services/otpGenrators";
import { generateReferralCode } from "../../services/referralCodes";
import { sendDynamicMail } from "../../services/sendEmail";
import { sendSMS } from "../../services/sendSMS";

// ****************************Function to handle registration logic****************************
export const performRegistration = async (
  business_email: string,
  username: string,
  business_mobile: string,
  password: string,
  refferal_code: string | null,
  role:string
): Promise<[boolean, any]> => {
  let referralCode: string | null = null;
  if (refferal_code != null) {
    referralCode = refferal_code;
  }
  const isExisting = await findUserByEmailUsername(
    //business_email, 
    username);
    console.log("isExisting",isExisting)
  if (isExisting) {
    return [true, isExisting];
  } else {
  const newUser = await createUser(
      business_email,
      password,
      business_mobile,
      username,
      referralCode,
      role
    );
    if (!newUser[0]) {
      return [false, "Unable to create new user"];
    } else {
      return [true, newUser];
    }
  }
};

//********************* Handler function to handle Existing Search*********************
// export const searchExisting = async (
//   //business_email: string,
//   //business_mobile: string,
//   username: string,
// ): Promise<boolean | any> => {
//   try {
//     const searchExist = {};
//     // // if (business_email !== undefined) {
//     // //   (searchExist as any).business_email = business_email;
//     // // }
//     // // if (business_mobile !== undefined) {
//     // //   (searchExist as any).business_mobile = business_mobile;
//     // // }
//     if (username !== undefined) {
//       (searchExist as any).username = username;
//     }
//     if (Object.keys(searchExist).length === 0) {
//       const errorResponse = {
//         error: "At least one search parameter is required.",
//       };
//       return [false, errorResponse];
//     }
//     console.log("username",username)
//     const result = await Registration.find(searchExist);
//     console.log(result)

//     const activeStatus=result.length>0?result[0].active:false
//     if (result && result.length > 0) {
//       const finalresult = {
//         found: true,
//         active:activeStatus
//       };
//       return [true, finalresult];
//     } 
//     else {
//       console.log("INNN ELSEEE")
//       const finalresult = {
//         found: false,
//       };
//       return [true, finalresult];
//     }
//   } catch (error) {
//     return [false, error];
//   }
// };

export const searchExisting = async (username: string): Promise<[boolean, any]> => {
  try {
    if (!username) {
      throw new Error("No Username Provided");
    }
    const result = await Registration.findOne({ username });
    const found = !!result;
    const active = found ? result.active : false;
    const finalResult = {
      found,
      active,
    };

    return [true, finalResult];
  } catch (error) {
    return [false, { error: error.message }];
  }
};

// **********************Function to handle Exisitng User during registration************************
// export const findUserByEmailUsername = async (
//   username: string
// ): Promise<boolean | any> => {
//   const user = await Registration.findOne({username});
//   if (!user) {
//     return false;
//   }
//   else {
//     return user;
//   }
 
// };
export const findUserByEmailUsername = async (
  username: string
): Promise<any> => {
  const user = await Registration.findOne({ username });
  if (!user) {
    return false;
  } else {
    const userStatus = user.active;
    const userId = user._id;
    if (userStatus !== true) {
      const otpGeneratedEmail = await generateOTP();
      const otpGeneratedMobile = await generateOTP();
      const updateField = { emailotp: otpGeneratedEmail, mobileotp: otpGeneratedMobile };
      const updatedUser = await businessUser.findOneAndUpdate(
          { userId: userId },
          { $set: updateField },
          { new: true }
        );
      return [true,user] 
    }}};
const createUser = async (
  business_email: string,
  password: string,
  business_mobile: string,
  username: string,
  refferal_code: string | null,
  role:string
): Promise<[boolean, any]> => {
  try {
    const hashedPassword = await CryptoJS.AES.encrypt(password,process.env.PASS_PHRASE).toString();
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
      const refuser=await Registration.findOne({ username: referralUser })
      referredBy=refuser.username
      // const referUserProfile = await UserKYC.findOne({ user: referralUser });
      // if (referUserProfile) {
      //   referredBy = (referUserProfile as any).Legal_Name_of_Business;
      // }
    }
    const newUser = await Registration.create({
      business_email,
      business_mobile,
      password: hashedPassword,
      username,
      oldPasswords: [hashedPassword],
      role:role
    });
    const otpGeneratedEmail = await generateOTP();
    const otpGeneratedMobile = await generateOTP();
    const { gstLimit, aadharLimit, panLimit, cin } =await globalSetting.findOne({ });
    const newBU = await businessUser.create({
      userId:newUser._id,
      refferedBy: referredBy,
      PAN_Attempt: panLimit,
      GST_Attempt: gstLimit,
      Aadhaar_Attempt: aadharLimit,
      cin: cin,
      mobileotp: otpGeneratedMobile,
      emailotp: otpGeneratedEmail,
    });
    await Referral.create({
      user: newUser._id,
      refferal_code: Refer_code,
    });
    const reqData = {
      Email_slug: "User_Login_OTP",
      email: business_email,
      VariablesEmail: [newBU.emailotp],

      receiverNo: business_mobile,
      Message_slug: "User_Login_OTP",
      VariablesMessage: [newBU.mobileotp],
    };
    await sendDynamicMail(reqData);
    await sendSMS(reqData);
    return [true, newUser];
  } catch (error) {
    console.error("Error in createUser:", error);
    return [false, error]; 
  }
};

// ****************************Function to validate User via OTP****************************
export const validateUserSignUp = async (
  otpVerifyType: string,
  otp: string,
  business_email_or_mobile: string,
  username: string
): Promise<[boolean, string | any]> => {
  let user;

  if (otpVerifyType === "email") {
    const userid = await Registration.findOne({ $and: [ { username: username },{ business_email: business_email_or_mobile }] }).select('_id');
    user = await businessUser.findOneAndUpdate(
      { userId: userid, emailotp: otp },
      { $set: { isemailotpverified: true } },
      { new: true }
    );
  } else if (otpVerifyType === "mobile") {
    const userid = await Registration.findOne({ $and: [{ username: username },{ business_mobile: business_email_or_mobile }] }).select('_id');
    user = await businessUser.findOneAndUpdate(
      { userId: userid, mobileotp: otp },
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
    const result = await Registration.findOneAndUpdate(
      { username:username },
      { $set: { active: true } },
      { new: true }
    );
    const token = await jwt.sign(
      { userId: result._id, role: result.role },
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
  password: string,
  request: string
): Promise<[boolean, string | any]> => {
  try {
    const user = await Registration.findOne({ username });
    if (!user) {
      throw new Error("Username not found");
    }
    const hashedPassword = CryptoJS.AES.decrypt(user.password, process.env.PASS_PHRASE);
    const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
    if (originalPassword !== password) {
      throw new Error("Wrong Password");
    }
    if (!request) {
      throw new Error("Request Not Provided");
    }
    const userRole = user.role;
    const roleCodeMap = {
      Business_User: "Business_User01",
      Admin: "Admin02",
      affiliatePartner: "affiliatePartner03",
    };
    const expectedCode = roleCodeMap[userRole];
    if (request !== expectedCode) {
      throw new Error("You are not authorized to login");
    }
    const otpGenerated = await generateOTP();
    const updatedUser = await Registration.findOneAndUpdate(
      { username },
      {
        $set: { MFA: otpGenerated },
      },
      { new: true }
    );
    // Send MFA over email and SMS
    const reqData = {
      Email_slug: "User_Login_OTP",
      email: updatedUser.business_email,
      VariablesEmail: [otpGenerated],
      receiverNo: updatedUser.business_mobile,
      Message_slug: "User_Login_OTP",
      VariablesMessage: [otpGenerated],
    };
    await sendDynamicMail(reqData);
    await sendSMS(reqData);
    return [true, updatedUser];
  } catch (error) {
    console.error("Error during authentication:", error);
    return [false, error.message];
  }
};

export const validateUserMFA = async (
  username: string,
  otp: string
): Promise<[boolean, string | any]> => {
  try {
    const user = await Registration.findOne({ username });
    if (!user) {
      return [false, "User not found"];
    }
    if (user.MFA !== otp) {
      return [false, "Invalid OTP"];
    }
    let token;
    if (user.role === "Maker" || user.role === "Checker") {
      const userId = user._id;
      const suOwner = await subUsers.findOne({ userId }).select('belongsTo');
      token = jwt.sign(
        { userId: user._id, role: user.role, belongsTo: suOwner.belongsTo },
        process.env.JWT_SECRET,
        { expiresIn: "3d" } 
      );
    } else {
      token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "3d" } 
      );
    }
    return [true, { token }];
  } catch (error) {
    return [false, error.message];
  }
};
export const resendverifycodeInternalUser = async (
  username: string
): Promise<[boolean, any]> => {
  try {
    const otpGenerated = await generateOTP();
    const updatedUser = await Registration.findOneAndUpdate(
      { username: username },
      { $set: { MFA: otpGenerated } },
      { new: true }
    );
    const reqData = {
      Email_slug: "Two_step_Verification_OTP",
      email: updatedUser.business_email,
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
  business_email_or_mobile: string,
  username: string
): Promise<[boolean, any]> => {
  try {
    const user= await Registration.findOne({username:username})
    const Id=user._id
    const otpGenerated = await generateOTP();
    let query = {};
    let fieldToUpdate = "";

    if (verificationType === "email") {
      query = { userId: Id };
      fieldToUpdate = "emailotp";
      await sendDynamicMail({
        Email_slug: "User_Login_OTP",
        email: business_email_or_mobile,
        VariablesEmail: [otpGenerated],
      });
    } else if (verificationType === "mobile") {
      query = { userId: Id };
      fieldToUpdate = "mobileotp";
      await sendSMS({
        receiverNo: business_email_or_mobile,
        Message_slug: "User_Login_OTP",
        VariablesMessage: [otpGenerated],
      }); 
    } else {
      return [false, "Invalid verification type"];
    }

    const updatedUser = await businessUser.findOneAndUpdate(
      query,
      { $set: { [fieldToUpdate]: otpGenerated } },
      { new: true }
    );

    if (updatedUser) {
      return [true, updatedUser];
    } else {
      return [false, "User not found or OTP update failed"];
    }
  } catch (error) {
    console.error("Error in Sending OTP:", error);
    return [false, "Failed to send OTP"];
  }
};


export const getlegaldocumentsInternal = async (): Promise<any[]> => {
  try {
    
    const result = await globalSetting.find().select('privacyPolicy termsOfService disclaimer').exec();
    
    return [true, result];
  } catch (error) {
   
    return error;
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
    const isExisting = await findUserByEmailUsername(
     // business_email,
      username);

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
      VariablesEmail: [user.username, otpGenerated],

      receiverNo: user.business_mobile,
      Message_slug: "Verification_OTP",
      VariablesMessage: [user.username,  otpGenerated],
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

  return [true, { token: token ,username:user.username}];
};

export const resendverifycodeInternalAdmin = async (
  username: string
): Promise<[boolean, any]> => {
  try {
    const otpGenerated = await generateOTP();
    const updatedUser = await Registration.findOneAndUpdate(
      { username: username },
      { $set: { MFA: otpGenerated } },
      { new: true }
    );
    const reqData = {
      Email_slug: "User_Login_OTP",
      email: updatedUser.business_email,
      VariablesEmail: [otpGenerated],

      receiverNo: updatedUser.business_mobile,
      Message_slug: "User_Login_OTP",
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
export function generateTemporaryPassword(): string {
  const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const specialCharacters = '!@#$%^&*()-_+=<>?';

  let password = '';

 
  password += uppercaseLetters[Math.floor(Math.random() * uppercaseLetters.length)];

  password += lowercaseLetters[Math.floor(Math.random() * lowercaseLetters.length)];
  
  password += digits[Math.floor(Math.random() * digits.length)];
 
  password += specialCharacters[Math.floor(Math.random() * specialCharacters.length)];

  // Generate the remaining characters randomly
  const remainingLength = 8 - password.length;
  const allCharacters = uppercaseLetters + lowercaseLetters + digits + specialCharacters;
  for (let i = 0; i < remainingLength; i++) {
    password += allCharacters[Math.floor(Math.random() * allCharacters.length)];
  }

  // Shuffle the password characters to make it random
  password = password.split('').sort(() => Math.random() - 0.5).join('');

  return password;
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
      { $set: {forgotpasswordotp: otpGenerated } },
      { new: true }
    );
    // Send OTP On Mail/Mobile
    const reqData = {
      Email_slug: "User_Login_OTP",
      email: updatedUser.business_email,
      VariablesEmail: [otpGenerated],

      receiverNo: updatedUser.business_mobile,
      Message_slug: "User_Login_OTP",
      VariablesMessage: [otpGenerated],
    };
    await sendDynamicMail(reqData);
    await sendSMS(reqData);
    if (updatedUser)
    return [true, updatedUser];
    else {
    return [false, updatedUser];
    }
  } catch (error) {
    console.error("Error in Sending OTP:", error);
    return [false, error];
  }
};
