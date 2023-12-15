import UserKYC1 from "../../models/userKYCs";
import Registration from "../../models/userRegisterations";
import businessUser from "../../models/businessUser";
import { awsinitialise } from "../../services/awsInitialise";
import { generateCustomUUID } from "../../services/generateUUID";
import {
  PAN_KYC_SB,
  GST_KYC_SB,
  Aadhaar_KYC_S1,
  Aadhaar_KYC_S2,
} from "../../services/sandboxs";

import { sendDynamicMail } from "../../services/sendEmail";
import { sendSMS } from "../../services/sendSMS";

export const getGSTDetailsInternal = async (
  gst: string,
  userId: string
): Promise<any> => {
  try {
    const user = await businessUser.findOne({ userId: userId });
    const userLimit = user.GST_Attempt;
    if (userLimit <= 0) {
      const user = await Registration.findOne({ _id: userId });
      const reqData = {
        Email_slug: "API_Limits_Exceeded",
        email: user.business_email,
        VariablesEmail: ["GST","www.assuredpay.in"],
        receiverNo: user.business_mobile,
        Message_slug: "API_Limits_Exceeded",
        VariablesMessage: ["GST","www.assuredpay.in"],
      };
      await sendDynamicMail(reqData);
      await sendSMS(reqData);
      return [false, "Your GST Verification Attempt exceeded"];
    }
    const newAttempt = user.GST_Attempt - 1;
    const GSTresult = await GST_KYC_SB({ id_number: gst,userlog:userId });
    const inputString = (GSTresult as any).body.data.gstin;
    const data = (GSTresult as any).body.data;
    const pan = inputString.substring(2, inputString.length - 3);
    const results = {
      Constitution_of_Business: data.ctb,
      Taxpayer_Type: data.dty,
      GSTIN_of_the_entity: data.gstin,
      Legal_Name_of_Business: data.lgnm,
      Business_PAN: pan,
      Date_of_Registration: data.rgdt,
      State: data.pradr.addr.stcd,
      Trade_Name: data.lgnm,
      Place_of_Business: `${data.pradr.addr.bno} ${data.pradr.addr.st} ${data.pradr.addr.loc} ${data.pradr.addr.dst} ${data.pradr.addr.pncd}`,
      Nature_of_Place_of_Business: data.pradr.ntr,
      Nature_of_Business_Activity: data.nba[0],
    };
    const attemptResult = await businessUser.findOneAndUpdate(
      { userId: userId },
      { $set: { GST_Attempt: newAttempt } },
      { new: true }
    );
    const remainingAttempt = attemptResult.GST_Attempt;
    const result = { result: results, leftAttempt: remainingAttempt };

    return [true, result];
  } catch (error) {
    return [false, error];
  }
};

export const saveGSTDetailsInternal = async (
  Constitution_of_Business: string,
  Taxpayer_Type: string,
  GSTIN_of_the_entity: string,
  Legal_Name_of_Business: string,
  Business_PAN: string,
  Date_of_Registration: string,
  State: string,
  Trade_Name: string,
  Place_of_Business: string,
  Nature_of_Place_of_Business: string,
  Nature_of_Business_Activity: string,
  userId: string,
  isGSTDetailSaveManually: string
): Promise<any> => {
  try {
    const filter = { user: userId }; 
    const bUser = await businessUser.findOne({ userId: userId }).select('userId');
    console.log("BusinessUser",bUser)
    const update = {
      Constitution_of_Business,
      Taxpayer_Type,
      GSTIN_of_the_entity,
      Legal_Name_of_Business,
      Business_PAN,
      Date_of_Registration,
      State,
      Trade_Name,
      Place_of_Business,
      Nature_of_Place_of_Business,
      Nature_of_Business_Activity,
      user: userId,
      businessUser:bUser,
      isGSTDetailSave: true,
      isGSTDetailSaveManually
    };
    const options = { upsert: true, new: true };
    const gstDetails = await UserKYC1.findOneAndUpdate(filter, update, options);
  const referenceIn= await businessUser.findOneAndUpdate({ userId: userId }, {$set:{kycId:gstDetails._id}})
  console.log("referenceIn",referenceIn)
    return [true, gstDetails];
  } catch (error) {
    console.error("Error in Saving Details:", error);
    return [false, error];
  }
};

export const getGSTDetailsInternalsaved = async (
  userId: string
): Promise<any> => {
  try {
    const result = await UserKYC1.findOne({ user: userId });
    return [true, result];
  } catch (error) {
    return [false, error];
  }
};

export const verifyAadharNumberInternal = async (
  userId: string,
  AadharNumber: string
): Promise<any | string> => {
  try {
    const { isGSTDetailSave } = await UserKYC1.findOne({
      user: userId,
    });
    if (isGSTDetailSave != true) {
      return [false, "Please complete your GST first"];
    }
    const userRemain = await businessUser.findOne({ userId: userId });
    const userLimit = userRemain.Aadhaar_Attempt;
    if (userLimit <= 0) {
      return [false, "Your Aadhar Verification Attempt exceeded "];
    }
    const result = await Aadhaar_KYC_S1({ id_number: AadharNumber });
    const refID = (result as any).body.data.ref_id;
    await UserKYC1.findOneAndUpdate(
      { user: userId },
      { $set: { aadhar_ref_id: refID } }
    );
    const leftAttempt = userRemain.Aadhaar_Attempt - 1;
    await businessUser.findOneAndUpdate(
      { userId: userId },
      { $set: { Aadhaar_Attempt: leftAttempt } },
      { new: true }
    );
    return [true, leftAttempt];
  } catch (error) {
    return [false, error];
  }
};

export const verifyAadharNumberOTPInternal = async (
  userId: string,
  aadharNum: string,
  otp: string
): Promise<any> => {
  try {
    const result1 = await UserKYC1.findOne({ user: userId });
    const refId = result1.aadhar_ref_id;
    const result = await Aadhaar_KYC_S2({ otp, refId });
    const data = (result as any).body.data;
    const base64String = data.photo_link;
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
    
    const imageBuffer = Buffer.from(base64Data, "base64");
    const s3ObjectUrl = await uploadtos3(refId, imageBuffer);
    const results = {
      aadharNumber: aadharNum,
      aadharCO: data.care_of,
      aadharGender: data.gender,
      nameInAadhaar: data.name,
      aadharDOB: data.dob,
      aadharCountry: data.split_address.country,
      distInAadhar: data.split_address.dist,
      aadharHouse: data.split_address.house,
      aadharPincode: data.split_address.pincode,
      aadharPO: data.split_address.po,
      aadharState: data.split_address.state,
      aadharStreet: data.split_address.street,
      aadharSubDistrict: data.split_address.subdist,
      cityInAadhar: data.split_address.vtc,
      addressInAadhar: data.split_address.country,
      aadharPhotoLink: s3ObjectUrl,
    };
    await UserKYC1.findOneAndUpdate(
      { user: userId },
      { $set: results, isAadharDetailSave: true },
      { new: true }
    );
const {aadharNumber,aadharPhotoLink,...resultSend}=results
const resultSendImage = {aadharPhotoLink: s3ObjectUrl, };
  return [true,{resultSend,resultSendImage}];
  } catch (error) {
    return [false, error];
  }
};

const uploadtos3 = async (refId: string, imageBuffer: any): Promise<any> => {
  const { params, s3 } = await awsinitialise(refId, imageBuffer);
  return new Promise<any>((resolve, reject) => {
    s3.upload(params, async (err, data) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
  
        resolve(data.Location);
      }
    });
  });
};

export const verifyPANDetails = async (
  PanNumber: string,
  id: string
): Promise<any | string> => {
  try {
    const user = await UserKYC1.findOne({
      user: id,
    });
    if (!user) {
      return [false, "User not found"];
    }
   
    const userRemain = await businessUser.findOne({ userId: id });
    const userLimit = userRemain.PAN_Attempt;
    if (userLimit <= 0) {
      return [false, "Your Pan Verification Attempt exceeded "];
    }
    const aadharFullName = user.nameInAadhaar;
    const myArray = aadharFullName.split(" ");
    const result = await PAN_KYC_SB({ id_number: PanNumber,userlog:id });
    const panFirstName = result.body.data.first_name.trim();
    const panNumber = result.body.data.pan;

    if (myArray[0].toLowerCase() === panFirstName.toLowerCase()) {
      await UserKYC1.findOneAndUpdate(
        { user: id },
        { $set: { isPANVerified: true, PAN_number: panNumber } },
        { new: true }
      );
      const newAttempt = userRemain.GST_Attempt - 1;
      await businessUser.findOneAndUpdate(
        { userId: id },
        { $set: { PAN_Attempt: newAttempt } },
        { new: true }
      );

      return [true, {"left_attempt":newAttempt}];
    } else {
      return [
        false,
        "Your PAN details don't match with the Aadhar name provided",
      ];
    }
  } catch (error) {
    throw error;
  }
};
export const userreferencenumberInternal = async (
  timestamp:string,
  latitude:string,
  longitude:string,
  accuracy:string,
  id:string
  ): Promise<any | string> => {
  try {
    const existingUser = await UserKYC1.findOne({ user: id, userRequestReference: { $exists: true } });
    // if (existingUser.userRequestReference) {
    //   return [false, "User already has a userRequestReference"];
    // }
    const update = {
      timestamp,
      latitude,
      longitude,
      accuracy
    };
    (existingUser as any).activities.push(update)
    const result =await existingUser.save();
    const generatedUUID = await generateCustomUUID();
    // const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    // const currentDate = new Date();
    // const day = ("0" + currentDate.getDate()).slice(-2);
    // const monthAbbreviation = months[currentDate.getMonth()];
    // const year = currentDate.getFullYear().toString().slice(-2);
    const formattedDate = Date.now();
    const updatedUser = await UserKYC1.findOneAndUpdate(
      { user: id },
      {
        $set: {
          userRequestReference: generatedUUID,
          kycrequested: formattedDate,
        },
      },
      { new: true }
    );
    if (!updatedUser) {
      return [false, "User not found"];
    }
    const res = updatedUser.userRequestReference;
    const user = await Registration.findOne({ _id: updatedUser.user });
    const reqData = {
      Email_slug: "User's_Application_Submitted",
      email: user.business_email,
      VariablesEmail: [generatedUUID],
      receiverNo: user.business_mobile,
      Message_slug: "User's_Application_Submitted",
      VariablesMessage: [generatedUUID],
    };

    await sendDynamicMail(reqData);
    await sendSMS(reqData);

    return [true, { userRequestReference: res }];
  } catch (error) {
    return [false, "Something Went Wrong"];
  }
};
export const setGlobalStatusInternal = async (
  globalStatus: string,
  userId: string
): Promise<[boolean, any]> => {
  try {
    const getGlobalStatus = await UserKYC1.findOneAndUpdate(
      { user: userId },
      { $set: { globalStatus: globalStatus } },
      { new: true }
    );
    return [true, getGlobalStatus];
  } catch (error) {
    console.error("Error in Saving Status:", error);
    return [false, error];
  }
};
export const getGlobalStatusInternal = async (
  userId: string
): Promise<[boolean, any]> => {
  try {

    const getGlobalStatus = await UserKYC1.findOne(
      { user: userId },
      { due: 1, globalStatus: 1 }
    );

    return [true, getGlobalStatus];
  } catch (error) {
    console.error("Error in Saving Status:", error);
    return [false, error];
  }
};
export const kycRedoRequestedInternal = async (
  timestamp: string,
  latitude: string,
  longitude:string,
  accuracy:string,
  userId:any
): Promise<any> => {
  try {
    const user = await UserKYC1.findOne({ user: userId })
    if (!user) {
      return { success: false, error: "User not found." };
    }
    user.Admin_AadhaarS1_Verification_Clarification=""
    user.Admin_AadhaarS2_Verification_Clarification=""
    user.Admin_Pan_Verification_Clarification=""
    user.Admin_GST_Verification_Clarification=""
   const update = {
    "timestamp": timestamp,
    "latitude": latitude,
    "longitude": longitude,
    "accuracy": accuracy,
  };
  (user as any).activities.push(update)
  user.due="reUpload";
  const result =await user.save();
    return ([ true , result]);
  } catch (error) {
    return { success: false, error: "An error occurred during the update." };
  }
};
export const getRejectedDocumentsInternal = async (id: string): Promise<any> => {
  try {
    const result = await UserKYC1.findOne({ user: id });
    if (result) {
      const rejectedDocuments = {};
      const addRejectedDocument = (
        key: string,
        clarificationKey: string,
        fileKey: string,
        statusKey: string
      )=>{
        if (result[statusKey] === 'Rejected') {
          rejectedDocuments[key] = {
            clarification: result[clarificationKey],
            fileUrl: result[fileKey],
            status: result[statusKey],
          };
        }
      };
      addRejectedDocument('AdminAadhaarS1Verified', 'Admin_AadhaarS1_Verification_Clarification', 'aadharFileUrl', 'AdminAadhaarS1Verified');
      addRejectedDocument('AdminAadhaarS2Verified', 'Admin_AadhaarS2_Verification_Clarification', 'aadharBackUrl', 'AdminAadhaarS2Verified');
      addRejectedDocument('AdminGSTVerified', 'Admin_GST_Verification_Clarification', 'GSTFILE', 'AdminGSTVerified');
      addRejectedDocument('AdminPanVerified', 'Admin_Pan_Verification_Clarification', 'PANFile', 'AdminPanVerified');
      const hasRejectedDocuments = Object.keys(rejectedDocuments).length > 0;
      return [hasRejectedDocuments, rejectedDocuments];
    } else {
      return [false, {}];
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getUUIDInternal = async (
  userId: string
): Promise<any> => {
  try {
    const result = await UserKYC1.findOne({ user: userId }).select('userRequestReference');
    return [true, result?.userRequestReference];
  } catch (error) {
    return [false, error];
  }
};