import UserKYC1 from "../../models/userKYCs";
import Registration from "../../models/userRegisterations";
import businessUser from "../../models/businessUser";
import { awsinitialise } from "../../services/awsInitialise";
import { generateUUID } from "../../services/generateUUID";
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
    const user = await businessUser.findOne({ userId: userId });
    const userLimit = user.GST_Attempt;
    console.log(userLimit)
    if (userLimit <= 0) {
      return [false, "Your GST Verification Attempt exceeded"];
    }
    const newAttempt = user.GST_Attempt - 1;
    const GSTresult = await GST_KYC_SB({ id_number: gst,userlog:userId });
    const attemptResult = await businessUser.findOneAndUpdate(
      { userId: userId },
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
// export const saveGSTDetailsInternal = async (
//   Constitution_of_Business: string,
//   Taxpayer_Type: string,
//   GSTIN_of_the_entity: string,
//   Legal_Name_of_Business: string,
//   Business_PAN: string,
//   Date_of_Registration: string,
//   State: string,
//   Trade_Name: string,
//   Place_of_Business: string,
//   Nature_of_Place_of_Business: string,
//   Nature_of_Business_Activity: string,
//   userId: string,
//   isGSTDetailSaveManually: string
// ): Promise<any> => {
//   try {
//     const gstDetails = await UserKYC1.create({
//       Constitution_of_Business: Constitution_of_Business,
//       Taxpayer_Type: Taxpayer_Type,
//       GSTIN_of_the_entity: GSTIN_of_the_entity,
//       Legal_Name_of_Business: Legal_Name_of_Business,
//       Business_PAN: Business_PAN,
//       Date_of_Registration: Date_of_Registration,
//       State: State,
//       Trade_Name: Trade_Name,
//       Place_of_Business: Place_of_Business,
//       Nature_of_Place_of_Business: Nature_of_Place_of_Business,
//       Nature_of_Business_Activity: Nature_of_Business_Activity,
//       user: userId,
//       isGSTDetailSave: true,
//       isGSTDetailSaveManually: isGSTDetailSaveManually,
//     },{ upsert: true, new: true });
//     return [true, gstDetails];
//   } catch (error) {
//     console.error("Error in Saving Details:", error);
//     return [false, error];
//   }
// };



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
    const filter = { user: userId }; // Filter by userId to find existing document
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

// Function to upload Aadhar Photo base 64 to S3 after converting it to url and send that url to frontend
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

// Function to verify PAN details

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
    if (user.isAadharDetailSave != true) {
      return [false, "User Aadhar details not Found"];
    }
    const userRemain = await businessUser.findOne({ userId: id });
    const userLimit = userRemain.PAN_Attempt;
    if (userLimit <= 0) {
      return [false, "Your GST Verification Attempt exceeded "];
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

// export const userreferencenumberInternal = async (id: string): Promise<any | string> => {
//   try {
//     // Check if user already has a userRequestReference
//     const existingUser = await UserKYC1.findOne({ user: id, userRequestReference: { $exists: true } });

//     if (existingUser) {
//       // User already has a userRequestReference
//       return [false, "User already has a userRequestReference"];
//     }

//     const generatedUUID = await generateUUID();
//     const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
//     const currentDate = new Date();
//     const day = ("0" + currentDate.getDate()).slice(-2);
//     const monthAbbreviation = months[currentDate.getMonth()];
//     const year = currentDate.getFullYear().toString().slice(-2);
//     const formattedDate = `${day} ${monthAbbreviation} ${year}`;
//     const updatedUser = await UserKYC1.findOneAndUpdate(
//       { user: id },
//       {
//         $set: {
//           userRequestReference: generatedUUID,
//           kycrequested: formattedDate,
//         },
//       },
//       { new: true }
//     );

//     if (!updatedUser) {
//       // Handle case where the user is not found in the database.
//       return [false, "User not found"];
//     }

//     const res = updatedUser.userRequestReference;
//     const user = await Registration.findOne({ _id: updatedUser.user });
//     const reqData = {
//       Email_slug: "Application_Under_Review",
//       email: user.business_email,
//       VariablesEmail: [user.username, generatedUUID],
//       receiverNo: user.business_mobile,
//       Message_slug: "Application_Under_Review",
//       VariablesMessage: [user.username, generatedUUID],
//     };

//     await sendDynamicMail(reqData);
//     await sendSMS(reqData);

//     return [true, { userRequestReference: res }];
//   } catch (error) {
//     return [false, "Something Went Wrong"];
//   }
// };


// export const userreferencenumberInternal = async (
//   id: string,
// ): Promise<any | string> => {
//   try {
//     const generatedUUID = await generateUUID();  
//     const months = [
//       "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
//       "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
//     ];
//     const currentDate = new Date();
//     const day = ("0" + currentDate.getDate()).slice(-2); // Add leading zero if day is single digit
//     const monthAbbreviation = months[currentDate.getMonth()];
//     const year = currentDate.getFullYear().toString().slice(-2); // Get last two digits of the year
//     const formattedDate = `${day} ${monthAbbreviation} ${year}`;
//     const updatedUser = await UserKYC1.findOneAndUpdate(
//       { user: id },
//       {
//         $set: {
//           userRequestReference: generatedUUID,
//           kycrequested: formattedDate,
//         },
//       },
//       { new: true }
//     );
//     if (!updatedUser) {
//       // Handle case where the user is not found in the database.
//       return [false, "User not found"];
//     }
//     const res=updatedUser.userRequestReference
//     const user = await Registration.findOne({ _id: updatedUser.user });
//     const reqData = {
//       Email_slug: "Application_Under_Review",
//       email: user.business_email,
//       VariablesEmail: [user.username, generatedUUID],

//       receiverNo: user.business_mobile,
//       Message_slug: "Application_Under_Review",
//       VariablesMessage: [user.username, generatedUUID],
//     };
//     await sendDynamicMail(reqData);
//     await sendSMS(reqData);
//     return [true, { userRequestReference: res }];
//   } catch (error) {
//     return [false," Something Went Wrong"];
//   }
// };

export const userreferencenumberInternal = async (id: string,
  mac:string,
  ip:string
  ): Promise<any | string> => {
  try {
    
    const existingUser = await UserKYC1.findOne({ user: id, userRequestReference: { $exists: true } });
  
    if (existingUser.userRequestReference) {
     
      return [false, "User already has a userRequestReference"];
    }
    const update = {
      "macaddress": mac,
      "ipAddress": ip
    };
    (existingUser as any).activities.push(update)
    const result =await existingUser.save();
 
    const generatedUUID = await generateUUID();
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const currentDate = new Date();
    const day = ("0" + currentDate.getDate()).slice(-2);
    const monthAbbreviation = months[currentDate.getMonth()];
    const year = currentDate.getFullYear().toString().slice(-2);
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

    if (!updatedUser) {
      return [false, "User not found"];
    }

    const res = updatedUser.userRequestReference;
    const user = await Registration.findOne({ _id: updatedUser.user });
    const reqData = {
      Email_slug: "User's Application Submitted",
      email: user.business_email,
      VariablesEmail: [user.username, generatedUUID],
      receiverNo: user.business_mobile,
      Message_slug: "User's Application Submitted",
      VariablesMessage: [user.username, generatedUUID],
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
  id: string,
  key: string,
  mac:string,
  ip:string
): Promise<any> => {
  try {

    const user = await UserKYC1.findOne({ user: id })

    if (!user) {
      return { success: false, error: "User not found." };
    }

    user.Admin_AadhaarS1_Verification_Clarification=""
    user.Admin_AadhaarS2_Verification_Clarification=""
   user.Admin_Pan_Verification_Clarification=""
   user.Admin_GST_Verification_Clarification=""
   const update = {
    "macaddress": mac,
    "ipAddress": ip
  };
  
  (user as any).activities.push(update)
    user.due=key;
    const result =await user.save();

   
    return ([ true , "result" ]);
  } catch (error) {
    return { success: false, error: "An error occurred during the update." };
  }
};



