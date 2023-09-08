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
export const verifyAadharNumberInternal = async (userId: string): Promise<any | string> => {
    try {
      const user = await UserKYC1.findOne({
        user: userId,
      });
  
      if (!user) {
        return 'User not found';
      }
  
      const aadhar = user.aadharNumber;
      console.log(aadhar);
  
      const result = await Aadhaar_KYC_S1({ id_number: aadhar });
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
    otp: string,
    refId: string
  ): Promise<any> => {
    try {
      const result = await Aadhaar_KYC_S2({ otp, refId });
      console.log(result);
      return result;
    } catch (error) {
      throw error;
    }
  };