import UserKYC1 from "../../models/userKYCs"; // Import your UserKYC1 model
import Registration from "../../models/userRegisterations";
import {
  PAN_KYC_SB,
  GST_KYC_SB,
  Aadhaar_KYC_S1,
  Aadhaar_KYC_S2,
} from "../../services/sandboxs"; // Import your sandbox module
// Function to verify PAN details

export const verifyPANDetails = async (
  PanNumber: string,
  id: string
): Promise<any | string> => {
  try {
    const user = await UserKYC1.findOne({
      user: id,
    });
    if(user.isAadharDetailSave!=true){

    }

    if (!user) {
      return [false, "User not found"];
    }
    if(user.isAadharDetailSave!=true){
      return[false,"User Aadhar details not Found"]
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
      return [false,"Your PAN details don't match with the Aadhar name provided"];
    }
  } catch (error) {
    throw error;
  }
};

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
    
     const result= {GSTresult:GSTresult, remainingAttempt: remainingAttempt };
    
     return [true,result]
   
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
    const {isGSTDetailSave} = await UserKYC1.findOne({
      user: userId,
    });
    if(isGSTDetailSave!=true){
     return[false,"Please complete your GST first"]      
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

export const userreferencenumberInternal = async (
  id: string,
  generatedUUID: string
): Promise<any | string> => {
  try {
    const currentDate = new Date();
    const updatedUser = await UserKYC1.findOneAndUpdate(
      { user: id },
      { $set: { userRequestReference: generatedUUID ,kycrequested:currentDate} },
      { new: true }
    );
    return [true, updatedUser];
  } catch (error) {
    return [false, error];
  }
};

// Function to verify Aadhar number OTP and Save details
export const verifyAadharNumberOTPInternal = async (
  userId: string,
  otp: string
): Promise<any> => {
  try {
    const result1 = await UserKYC1.findOne({ user: userId });
    const refId = result1.aadhar_ref_id;
    const result = await Aadhaar_KYC_S2({ otp, refId });
    const data = (result as any).body.data;
    const results = {
      aadharNumber: "",
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
      aadharphotoLink : data.photo_link,
    };
   const resultSaved=await UserKYC1.findOneAndUpdate(
    { user: userId },
    { $set: results },
    { new: true }
  );
   
    return [true, results];
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
  isGSTDetailSaveManually:string
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
      isGSTDetailSaveManually:isGSTDetailSaveManually
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
