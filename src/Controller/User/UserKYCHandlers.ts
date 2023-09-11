import UserKYC1 from '../../Models/UserKYC'; // Import your UserKYC1 model
import {PAN_KYC_SB,GST_KYC_SB,Aadhaar_KYC_S1,Aadhaar_KYC_S2} from '../../Services/sandbox'; // Import your sandbox module
// Function to verify PAN details

export const verifyPANDetails = async (id: string): Promise<any| string> => {
    try {
      const user = await UserKYC1.findOne({
        user: id,
      });
  
      if (!user) {
        return 'User not found';
      }
  
      const pan = user.PAN_Company_number;
      const businessName = user.business_name;
  
      const result = await PAN_KYC_SB({ id_number: pan });
      const fullName = result.body.data.full_name;
  
      if (businessName === fullName) {
        const updatedUser = await UserKYC1.findOneAndUpdate(
          { user: id },
          { $set: { isPANVerified: true } }
        );
  
        return updatedUser;
      } else {
        return "Your PAN details don't match with the business name provided";
      }
    } catch (error) {
      throw error;
    }
  };

// Function to get GST details
export const getGSTDetailsInternal = async (gst: string): Promise<any> => {
    try {
      const result = await GST_KYC_SB({ id_number: gst });
      return result;
    } catch (error) {
      throw error;
    }
  };  

// Function to verify Aadhar number and update the reference ID
export const verifyAadharNumberInternal = async (userId: string,AadharNumber:string): Promise<any | string> => {
    try {
      // const user = await UserKYC1.findOne({
      //   user: userId,
      // });
  
      // if (!user) {
      //   return 'User not found';
      // }
  
      // const aadhar = user.aadharNumber;
      // console.log(aadhar);
  
      const result = await Aadhaar_KYC_S1({ id_number: AadharNumber });
      console.log(result)
      const refID = (result as any).body.data.ref_id;
  
      const updatedUser = await UserKYC1.findOneAndUpdate(
        { user: userId },
        { $set: { aadhar_ref_id: refID } }
      );
  
      console.log(updatedUser);
      return updatedUser;
    } catch (error) {
      throw error;
    }
  };
  
  // Function to verify Aadhar number OTP
export const verifyAadharNumberOTPInternal = async (
    userId: string,
    otp: string
   
  ): Promise<any> => {
    try {
      const result1=await UserKYC1.findOne({user:userId})
      console.log(result1)
      const refId=result1.aadhar_ref_id
      const result = await Aadhaar_KYC_S2({ otp, refId });
       console.log(result);
      return result;
    } catch (error) {
      throw error;
    }
  };

   // Function to save GST Details
  export const saveGSTDetailsInternal = async (
    Constituion_of_Business:string,
    Taxpayer_Type:string,
    GSTIN_of_the_entity:string,
    Legal_Name_of_Business:string,
    Business_PAN:string,
    Date_of_Registration:string,
    State:string,
    Trade_Name:string,
    Place_of_Business:string,
    Nature_of_Place_of_Business:string,
    Nature_of_Business_Activity:string,
    userId:string
    ): Promise<any> => {
    try {
    const gstDetails =await UserKYC1.create(
  { 
      "Constituion_of_Business":Constituion_of_Business,
      "Taxpayer_Type":Taxpayer_Type,
      "GSTIN_of_the_entity":GSTIN_of_the_entity,
      "Legal_Name_of_Business":Legal_Name_of_Business,
      "Business_PAN":Business_PAN,
     "Date_of_Registration": Date_of_Registration,
     "State": State,
      "Trade_Name":Trade_Name,
      "Place_of_Business":Place_of_Business,
      "Nature_of_Place_of_Business":Nature_of_Place_of_Business,
      "Nature_of_Business_Activity":Nature_of_Business_Activity,
      "user":userId,
      "isGSTDetailSave":true
     }
    
    
    );
   
      return [true, gstDetails];
    } catch (error) {
      console.error("Error in Saving Details:", error);
      return [false, error]; 
    }
    
  };

  // Function to get saved GST Details
  export const getGSTDetailsInternalsaved = async (userId: string): Promise<any> => {
    try {
      const result = await UserKYC1.findOne({ user: userId });
      return result;
    } catch (error) {
      throw error;
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

