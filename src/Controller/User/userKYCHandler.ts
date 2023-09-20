//import { set } from 'mongoose';
import globalSetting from "../../Models/globalAdminSettings"
import UserKYC1 from '../../Models/userKYCs'; // Import your UserKYC1 model
import Registration from '../../Models/userRegisterations';
import {PAN_KYC_SB,GST_KYC_SB,Aadhaar_KYC_S1,Aadhaar_KYC_S2} from '../../Services/sandboxs'; // Import your sandbox module
// Function to verify PAN details

export const verifyPANDetails = async (PanNumber:string,id: string): Promise<any| string> => {
    try {
      const user = await UserKYC1.findOne({
        user: id,
      });
  
      if (!user) {
        return [ false,'User not found'];
      }


      const aadharFullName=user.nameInAadhaar
      const myArray =aadharFullName.split(" ");
       
      
      const maxLimit=await globalSetting.findOne({id:"globalSetting"})
      const maxPanLimit=maxLimit.panLimit
      const userLimit=user.PAN_Attempt
      
      if(userLimit>=maxPanLimit){
        return [false,"Your PAN Verification Attempt exceeded "];
      }
      const result = await PAN_KYC_SB({ id_number: PanNumber });
    
      const panFirstName = result.body.data.first_name.trim();
      const panNumber=result.body.data.pan;
      const newAttempt=user.PAN_Attempt
  
      if (myArray[0].toLowerCase() === panFirstName.toLowerCase()) {
        const updatedUser = await UserKYC1.findOneAndUpdate(
          { user: id },
          { $set: { isPANVerified: true,
            PAN_number:panNumber,PAN_Attempt:newAttempt }},
          { new:true });

          
  
        return [true,updatedUser];
      } else {
        return [false,"Your PAN details don't match with the Aadhar name provided"];
      }
    } catch (error) {
      throw error;
    }
  };

// Function to get GST details
export const getGSTDetailsInternal = async (gst: string): Promise<any> => {
    try {
      const result = await GST_KYC_SB({ id_number: gst });
      return [true,result];
    } catch (error) {
      return[false,error] ;
    }
  };  

// Function to verify Aadhar number and update the reference ID
export const verifyAadharNumberInternal = async (userId: string,AadharNumber:string): Promise<any | string> => {
    try {
  
      const result = await Aadhaar_KYC_S1({ id_number: AadharNumber });
      const refID = (result as any).body.data.ref_id;
  
      const updatedUser = await UserKYC1.findOneAndUpdate(
        { user: userId },
        { $set: { aadhar_ref_id: refID } }
      );
  
      console.log(updatedUser);
      return [true,updatedUser];
    } catch (error) {
      return[false,error];
    }
  };

  export const userreferencenumberInternal = async (id: string,generatedUUID:string): Promise<any | string> => {
    try { 
      const updatedUser = await UserKYC1.findOneAndUpdate(
        { user: id },
        { $set: { userRequestReference: generatedUUID } },{ new: true }
      );
      return [true,updatedUser];
    } catch (error) {
      return[false,error];
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
      return [true,result];
    } catch (error) {
     return[false,error];
    }
  };

   // Function to save GST Details
  export const saveAadharDetailsInternal = async (
    aadharNumber:string,
    aadharCO:string,
    aadharGender:string,
    nameInAadhaar:string,
    aadharDOB:string,
    aadharPhotoLink:string,
    aadharCountry:string,
    distInAadhar:string,
    aadharHouse:string,
    aadharPincode:string,
    aadharPO:string,
    aadharState:string,
    aadharStreet:string,
    aadharSubDistrict:string,
    cityInAadhar:string,
    addressInAadhar:string,
    userId:string
    ): Promise<any> => {
    try {
    const user = await Registration.findOne({ _id:userId });
    const aadharDetails =await UserKYC1.findOneAndUpdate({user:user._id},
     { $set:{ 
      "aadharNumber":aadharNumber,
      "aadharCO":aadharCO,
      "aadharGender":aadharGender,
      "nameInAadhaar":nameInAadhaar,
      "aadharDOB":aadharDOB,
     "aadharPhotoLink": aadharPhotoLink,
     "aadharCountry": aadharCountry,
      "distInAadhar":distInAadhar,
      "aadharHouse":aadharHouse,
      "aadharPincode":aadharPincode,
      "aadharPO":aadharPO,
      "aadharState":aadharState,
      "aadharStreet":aadharStreet,
      "aadharSubDistrict":aadharSubDistrict,
      "cityInAadhar":cityInAadhar,
      "addressInAadhar":addressInAadhar,
      "user":userId,
      "isAadharDetailSave":true
     }}, { new: true }
    
    
    );
   
      return [true, aadharDetails];
    } catch (error) {
      console.error("Error in Saving Details:", error);
      return [false, error]; 
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
      return[true, result];
    } catch (error) {
      return[false,error] ;
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

