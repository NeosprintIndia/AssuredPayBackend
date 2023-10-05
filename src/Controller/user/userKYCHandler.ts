import UserKYC1 from "../../models/userKYCs";
import Registration from "../../models/userRegisterations";
import { awsinitialise } from "../../services/awsInitialise";
const fs = require("fs");
import {
  PAN_KYC_SB,
  GST_KYC_SB,
  Aadhaar_KYC_S1,
  Aadhaar_KYC_S2,
} from "../../services/sandboxs";

import { sendDynamicMail } from "../../services/sendEmail";
import { sendSMS } from "../../services/sendSMS";

// Function to get GST details
export const getGSTDetailsInternal = async (
  gst: string,
  userId: string
): Promise<any> => {
  try {
    const user = await Registration.findOne({ _id: userId });
    const userLimit = user.GST_Attempt;
    if (userLimit <= 0) {
      return [false, "Your GST Verification Attempt exceeded "];
    }
    const GSTresult = await GST_KYC_SB({ id_number: gst });
    const newAttempt = user.GST_Attempt - 1;
    const attemptResult = await Registration.findOneAndUpdate(
      { _id: userId },
      { $set: { GST_Attempt: newAttempt } },
      { new: true }
    );
    const remainingAttempt = attemptResult.GST_Attempt;

    const result = { GSTresult: GSTresult, remainingAttempt: remainingAttempt };

    return [true, result];
  } catch (error) {
    return [false, error];
  }
};

// Function to save GST Details
export const saveGSTDetailsInternal = async (
  Constituion_of_Business: string,
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
    const gstDetails = await UserKYC1.create({
      Constituion_of_Business: Constituion_of_Business,
      Taxpayer_Type: Taxpayer_Type,
      GSTIN_of_the_entity: GSTIN_of_the_entity,
      Legal_Name_of_Business: Legal_Name_of_Business,
      Business_PAN: Business_PAN,
      Date_of_Registration: Date_of_Registration,
      State: State,
      Trade_Name: Trade_Name,
      Place_of_Business: Place_of_Business,
      Nature_of_Place_of_Business: Nature_of_Place_of_Business,
      Nature_of_Business_Activity: Nature_of_Business_Activity,
      user: userId,
      isGSTDetailSave: true,
      isGSTDetailSaveManually: isGSTDetailSaveManually,
    });
    return [true, gstDetails];
  } catch (error) {
    console.error("Error in Saving Details:", error);
    return [false, error];
  }
};

// Function to get saved GST Details
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

// Function to verify Aadhar number and update the reference ID
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
    const userRemain = await Registration.findOne({ _id: userId });
    const userLimit = userRemain.Aadhaar_Attempt;
    if (userLimit <= 0) {
      return [false, "Your Aadhar Verification Attempt exceeded "];
    }
    const result = await Aadhaar_KYC_S1({ id_number: AadharNumber });
    const refID = (result as any).body.data.ref_id;
    const updatedUser = await UserKYC1.findOneAndUpdate(
      { user: userId },
      { $set: { aadhar_ref_id: refID } }
    );
    const leftAttempt = userRemain.Aadhaar_Attempt - 1;
    await Registration.findOneAndUpdate(
      { _id: userId },
      { $set: { Aadhaar_Attempt: leftAttempt } },
      { new: true }
    );
    return [true, leftAttempt];
  } catch (error) {
    return [false, error];
  }
};

// Function to verify Aadhar number OTP and Save details
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

    // Remove the data:image/png;base64 header if present
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");

    // Create a buffer from the base64 data
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

    const resultSaved = await UserKYC1.findOneAndUpdate(
      { user: userId },
      { $set: results, isAadharDetailSave: true },
      { new: true }
    );

    return [true, results];
  } catch (error) {
    return [false, error];
  }
};

// Function to upload Aadhar Photo base 64 to S3 after converting it to url and send that url to frontend
const uploadtos3 = async (refId: string, imageBuffer: any): Promise<any> => {
  const { params, s3 } = await awsinitialise(refId, imageBuffer);
  return new Promise<any>((resolve, reject) => {
    s3.upload(params, async (err, data) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        console.log("DATA LOCATION", data.Location);
        resolve(data.Location);
      }
    });
  });
};

// Function to verify PAN details

export const verifyPANDetails = async (
  PanNumber: string,
  id: string
): Promise<any | string> => {
  try {
    const user = await UserKYC1.findOne({
      user: id,
    });
    if (user.isAadharDetailSave != true) {
    }

    if (!user) {
      return [false, "User not found"];
    }
    if (user.isAadharDetailSave != true) {
      return [false, "User Aadhar details not Found"];
    }
    const userRemain = await Registration.findOne({ _id: id });
    const userLimit = userRemain.PAN_Attempt;
    if (userLimit <= 0) {
      return [false, "Your GST Verification Attempt exceeded "];
    }
    const aadharFullName = user.nameInAadhaar;
    const myArray = aadharFullName.split(" ");
    const result = await PAN_KYC_SB({ id_number: PanNumber });
    const panFirstName = result.body.data.first_name.trim();
    const panNumber = result.body.data.pan;

    if (myArray[0].toLowerCase() === panFirstName.toLowerCase()) {
      await UserKYC1.findOneAndUpdate(
        { user: id },
        { $set: { isPANVerified: true, PAN_number: panNumber } },
        { new: true }
      );
      const newAttempt = userRemain.GST_Attempt - 1;
      await Registration.findOneAndUpdate(
        { _id: id },
        { $set: { GST_Attempt: newAttempt } },
        { new: true }
      );

      return [true, newAttempt];
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
  id: string,
  generatedUUID: string
): Promise<any | string> => {
  try {
    const months = [
      "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
      "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
    ];
    const currentDate = new Date();
    const day = ("0" + currentDate.getDate()).slice(-2); // Add leading zero if day is single digit
    const monthAbbreviation = months[currentDate.getMonth()];
    const year = currentDate.getFullYear().toString().slice(-2); // Get last two digits of the year
    const formattedDate = `${day} ${monthAbbreviation} ${year}`;
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
    const res=updatedUser.userRequestReference
    const user = await Registration.findOne({ _id: updatedUser.user });
    const reqData = {
      Email_slug: "Application_Under_Review",
      email: user.business_email,
      VariablesEmail: [user.username, generatedUUID],

      receiverNo: user.business_mobile,
      Message_slug: "Application_Under_Review",
      VariablesMessage: [user.username, generatedUUID],
    };
    await sendDynamicMail(reqData);
    await sendSMS(reqData);
    return [true, {userRequestReference:res}];
  } catch (error) {
    return [false, error];
  }
};

export const getGlobalStatusInternal = async (
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
