import UserKYC1 from '../../Models/userKYCs'; // Import your UserKYC1 model
import adminGlobalSetting from "../../Models/globalAdminSettings";
var ObjectId = require('mongodb').ObjectID;


// Function to retrieve all KYC records
export const getAllKYCRecordsInternal = async (): Promise<any[]> => {
  try {
    const result = await UserKYC1.find().select({Legal_Name_of_Business:1, due:1 ,createdAt:1}).populate('user', 'refferedBy');
    console.log(result);
    return [true,result];
  } catch (error) { 
    return [false,error];
  }
};
// Function to approve Admin Aadhar S1 verification
export const approveAdminAadharS1Internal = async (
    id: string,
    adminAadhaarS1Verified: boolean
  ): Promise<any | null> => {
    try {
      const result = await UserKYC1.findOneAndUpdate(
        { user: id },
        { $set: { AdminAadhaarS1Verified: adminAadhaarS1Verified } },{ new: true }
      );
      console.log(result);
      return [true,result];
    } catch (error) {
      return[false,error];
    }
  };

  export const setLimitInternal = async (gstLimit:number,
    aadharLimit:number,
    panLimit:number,
    cin:number,
    termsOfService:string,
    privacyPolicy:string,
    disclaimer:string,
    enrollmentFees:number): Promise<any> => {
    try {
      const limitUpdate = {
        // You can initialize with default values or an empty object
      };
      
      if (gstLimit !== undefined) {
        (limitUpdate as any).gstLimit = gstLimit;
      }
      
      if (aadharLimit!== undefined) {
        (limitUpdate as any).aadharLimit = aadharLimit;
      }
      
      if (panLimit !== undefined) {
        (limitUpdate as any).panLimit = panLimit;
      }
      
      if (cin !== undefined) {
        (limitUpdate as any).cin = cin;
      }
      if (termsOfService !== undefined) {
        (limitUpdate as any).termsOfService = termsOfService;
      }
      
      if (privacyPolicy!== undefined) {
        (limitUpdate as any).privacyPolicy = privacyPolicy;
      }
      
      if (disclaimer !== undefined) {
        (limitUpdate as any).disclaimer = disclaimer;
      }
      
      if (enrollmentFees !== undefined) {
        (limitUpdate as any).enrollmentFees = enrollmentFees;
      }
      console.log(limitUpdate)
      const updated=await adminGlobalSetting.findOneAndUpdate(
        { id: "globalSetting" },
        { $set: limitUpdate
       },
        { new:true });
      return [true ,updated];
    } catch (error) {
      return error;
    }
  };

  export const getAllConfigurationInternal = async (): Promise<any[]> => {
    try {
      const result = await adminGlobalSetting.find();
      console.log(result);
      return [true ,result];
    } catch (error) {
      return error;
    }
  };

  export const getuserbusinessdetailInternal = async (id): Promise<any[]> => {
    try {
      const result = await UserKYC1.find({user:id})
      console.log("User Result",result);
      return [true,result];
    } catch (error) { 
      return [false,error];
    }
  };

  export const approvebusinessdetailInternal = async (
    id: string,
    status: string
  ): Promise<any> => {
    try {
      console.log("In try",id,status)
      const result = await UserKYC1.findOneAndUpdate(
        { user: id },
        { $set: { due: status } },
        { new: true }
      );
      console.log(result);
      return [true,  result ];
    } catch (error) {
      return  error;
    }
  };