import UserKYC1 from '../../models/userKYCs'; 
import Registration from "../../models/userRegisterations"
import adminGlobalSetting from "../../models/globalAdminSettings";


// Function to retrieve all KYC records based on sorting

export const getAllKYCRecordsInternal = async (
  page: number = 1, 
  pageSize: number = 10, 
  due: string | null = null, 
  search: string | null = null 
): Promise<any[]> => { 
  try {
    const skipCount = (page - 1) * pageSize;
    let query = UserKYC1.find()
      .select({ Legal_Name_of_Business: 1, GSTIN_of_the_entity: 1, userRequestReference: 1, due: 1, kycrequested: 1 ,user:1,currentStatus:1})
      .populate('businessUser', 'refferedBy')
      .sort({ updatedAt: -1 });
      query = query.where('userRequestReference').ne('');
    if (due !== null) {
      query = query.where('due').equals(due);
    }
    if (search !== null) {
      query.or([
        { userRequestReference: search },
        { GSTIN_of_the_entity: search }
      ]);
    }
    const results: any[] = await query.skip(skipCount).limit(pageSize).exec();
    // const dueCounts = {
    //   approved: await UserKYC1.countDocuments({ due: 'Approved' }),
    //   rejected: await UserKYC1.countDocuments({ due: 'Rejected' }),
    //   new: await UserKYC1.countDocuments({ due: 'New' }),
    //   total: await UserKYC1.countDocuments(),
    // };
    const dueCounts = {
      approved: await UserKYC1.countDocuments({ due: 'Approved', userRequestReference: { $ne: '' } }),
      rejected: await UserKYC1.countDocuments({ due: 'Rejected', userRequestReference: { $ne: '' } }),
      new: await UserKYC1.countDocuments({ due: 'New', userRequestReference: { $ne: '' } }),
      total: await UserKYC1.countDocuments({ userRequestReference: { $ne: '' } }),
    };
    return [true, { results, dueCounts }];
  } catch (error) {
   
    return [false, error];
  }
};

// Function to update various limits and settings in the global admin configuration
export const setLimitInternal = async (
  gstLimit: number, 
  aadharLimit: number, 
  panLimit: number, 
  cin: number, 
  termsOfService: string, 
  privacyPolicy: string, 
  disclaimer: string, 
  enrollmentFees: number, 
  sellerpaymentRequestDuration:number,
  sellerfeePercentageRecieveable:number,
  buyerpaymentRequestDuration:number,
  buyerfeePercentageRecieveable:number,
  commissionEligibility:number,
  refferalCommission:number
): Promise<any> => {
  try {
  
    const limitUpdate = {};

    
    if (gstLimit !== undefined) {
      (limitUpdate as any).gstLimit = gstLimit;
    }

    if (aadharLimit !== undefined) {
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

    if (privacyPolicy !== undefined) {
      (limitUpdate as any).privacyPolicy = privacyPolicy;
    }

    if (disclaimer !== undefined) {
      (limitUpdate as any).disclaimer = disclaimer;
    }

    if (enrollmentFees !== undefined) {
      (limitUpdate as any).enrollmentFees = enrollmentFees;
    }
    if (sellerpaymentRequestDuration !== undefined) {
      (limitUpdate as any).sellerpaymentRequestDuration = sellerpaymentRequestDuration;
    }

    if (sellerfeePercentageRecieveable !== undefined) {
      (limitUpdate as any).sellerfeePercentageRecieveable = sellerfeePercentageRecieveable;
    }

    if (buyerpaymentRequestDuration !== undefined) {
      (limitUpdate as any).buyerpaymentRequestDuration = buyerpaymentRequestDuration;
    }

    if (buyerfeePercentageRecieveable !== undefined) {
      (limitUpdate as any).buyerfeePercentageRecieveable = buyerfeePercentageRecieveable;
    }
    if (commissionEligibility !== undefined) {
      (limitUpdate as any).commissionEligibility = commissionEligibility;
    }
    if (refferalCommission !== undefined) {
      (limitUpdate as any).refferalCommission = refferalCommission;
    }
   
   
    const updated = await adminGlobalSetting.findOneAndUpdate({},
      {
        $set: limitUpdate 
      },
      { new: true,upsert: true }
    );

   
    const updatedFields = {};
    for (const key in limitUpdate) {
      if (limitUpdate.hasOwnProperty(key)) {
        updatedFields[key] = updated[key];
      }
    }

  
    return [true, updatedFields];

  } catch (error) {

    return error;
  }
};

// Function to retrieve all configuration settings from the global admin configuration

export const getAllConfigurationInternal = async (): Promise<any[]> => {
  try {
    
    const result = await adminGlobalSetting.find(); 
    return [true, result[0]];
  } catch (error) {
    return error;
  }
};

// Function to retrieve business details for a specific user from the UserKYC1 collection in the database
export const getuserbusinessdetailInternal = async (id): Promise<any[]> => {
  try {
  
    const result:any = await UserKYC1.findOne({ user: id }).select({
      Constitution_of_Business: 1,
      Taxpayer_Type: 1,
      GSTIN_of_the_entity: 1,
      State: 1,
      Business_PAN: 1,
      Date_of_Registration: 1,
      Nature_of_Place_of_Business: 1,
      Trade_Name: 1,
      Place_of_Business: 1,
      Nature_of_Business_Activity: 1, 
      isGSTDetailSaveManually:1, 
      GSTFILE: 1,
      AdminGSTVerified:1
    });

    if (!result) {
      return [false, "User KYC data not found"];
    }
    const resultFiles = {
      GSTFILE: result?.GSTFILE || null,
    };
    const status = {
      AdminGSTVerified:result?.AdminGSTVerified || null,
    };
    const restResult = {
      Constitution_of_Business: result?.Constitution_of_Business || null,
      Taxpayer_Type: result?.Taxpayer_Type || null,
      GSTIN_of_the_entity: result?.GSTIN_of_the_entity || null,
      State: result?.State || null,
      Business_PAN: result?.Business_PAN || null,
      Date_of_Registration: result?.Date_of_Registration || null,
      Nature_of_Place_of_Business: result?.Nature_of_Place_of_Business || null,
      Trade_Name: result?.Trade_Name || null,
      Place_of_Business: result?.Place_of_Business || null,
      Nature_of_Business_Activity: result?.Nature_of_Business_Activity || null,
    };
    const fetchType={ isGSTDetailSaveManually: result?.isGSTDetailSaveManually || null,} 
    return [true, {resultFiles,restResult,fetchType,status}];
  } catch (error) {
  
    return [false, error];
  }
};

// Function to retrieve business representative details for a specific user from the UserKYC1 collection in the database

export const getbusinessrepresentativedetailInternal = async (id): Promise<any[]> => {
  try {
 
    const leftCount = await Registration.findOne({ _id: id }).select({ Aadhaar_Attempt: 1 });
    const result = await UserKYC1.findOne({ user: id }).select({
      aadharCO: 1,
      aadharDOB: 1,
      aadharGender: 1,
      nameInAadhaar: 1,
      aadharCountry: 1,
      distInAadhar: 1,
      aadharHouse: 1,
      aadharPincode: 1,
      aadharPO: 1,
      aadharState: 1,
      aadharStreet: 1,
      aadharFileUrl: 1,
      aadharBackUrl: 1,
      PANFile: 1,
      aadharPhotoLink: 1,
      aadharNumber: 1,
      AdminPanVerified:1,
      AdminAadhaarS1Verified:1,
      AdminAadhaarS2Verified:1

    });
    if (!result || !leftCount) {
      return [false, "User KYC data or left count not found"];
    }
    const resultFiles = {
      aadharFileUrl: result?.aadharFileUrl || null,
      aadharBackUrl: result?.aadharBackUrl || null,
      PANFile: result?.PANFile || null
    };
    const restResult = {
      aadharCO: result?.aadharCO || null,
      aadharDOB: result?.aadharDOB || null,
      aadharGender: result?.aadharGender || null,
      nameInAadhaar: result?.nameInAadhaar || null,
      aadharCountry: result?.aadharCountry || null,
      distInAadhar: result?.distInAadhar || null,
      aadharHouse: result?.aadharHouse || null,
      aadharPincode: result?.aadharPincode || null,
      aadharPO: result?.aadharPO || null,
      aadharState: result?.aadharState || null,
      aadharStreet: result?.aadharStreet || null
    };
    const resultAadharPhoto = {
      aadharPhotoLink: result?.aadharPhotoLink || null,
      aadharNumber: result?.aadharNumber || null
    };
    const status={
      AdminPanVerified: result?.AdminPanVerified || null,
      AdminAadhaarS1Verified: result?.AdminAadhaarS1Verified || null,
      AdminAadhaarS2Verified: result?.AdminAadhaarS2Verified || null
    }

    return [true, { restResult, resultFiles, resultAadharPhoto, leftCount,status }];
  } catch (error) {
    return [false, error];
  }
};
export const finalstatusInternal = async (
  id: string,
  key: string
): Promise<any> => { 
  try {
    const user  = await UserKYC1.findOne({ user: id })
    if (!user) {
      return { success: false, error: "User not found." };
    }
    if ((key === "Approved" &&
    (user.AdminAadhaarS1Verified !== "Approved" ||
     user.AdminAadhaarS2Verified !== "Approved" ||
     user.AdminPanVerified !== "Approved" ||
     user.AdminGSTVerified !== "Approved")) ||
    (key === "Rejected" &&
     user.AdminAadhaarS1Verified === "Approved" &&
     user.AdminAadhaarS2Verified === "Approved" &&
     user.AdminPanVerified === "Approved" &&
     user.AdminGSTVerified === "Approved")
) {
    return [false, key === "Approved" ? "Please make sure all documents are approved before final approval" : "Cannot reject when all  documents are approved"];
}
    const lastElement = user.activities[user.activities.length-1];
    user.due=key;
    lastElement.Admin_AadhaarS1_Verification_Clarification=user.Admin_AadhaarS1_Verification_Clarification
    lastElement.Admin_AadhaarS2_Verification_Clarification=user.Admin_AadhaarS2_Verification_Clarification
    lastElement.Admin_Pan_Verification_Clarification=user.Admin_Pan_Verification_Clarification
    lastElement.Admin_GST_Verification_Clarification=user.Admin_GST_Verification_Clarification
    await user.save();
    return ([ true , "Operation Completed Successfully" ]);
  } catch (error) {
    return { success: false, error: "An error occurred during the update." };
  }
};
// Function to update document approval status in the UserKYC1 collection based on provided parameters
export const approveDocumentInternal = async (
  _flag: any,
  status: string,
  id: string
): Promise<any | null> => {
  try {
    const existingDocument = await UserKYC1.findOne({ user: id });
    if (existingDocument && existingDocument[_flag] === status) {
      return [true, "Document already approved"];
    }

    // Update the document status
    const updateData = { [_flag]: status,updated_at:new Date()};
    const result = await UserKYC1.findOneAndUpdate(
      { user: id },
      updateData,
      { new: true }
    );

    return [true, result];
  } catch (error) {
    return [false, error];
  }
};
// Function to reject a document in the UserKYC1 collection based on provided parameters
export const rejectDocumentInternal = async (
  filename: string, 
  status: string, 
  id: string, 
  docNameKey: string, 
  clarification: string 
): Promise<any | null> => {
  try {
    
    const updateData = { [filename]: status, [docNameKey]: clarification };

    
    const result = await UserKYC1.findOneAndUpdate(
      { user: id }, 
      updateData, 
      { new: true } 
    );

    return [true, result];
  } catch (error) {
  
    return [false, error];
  }
};
// export const filenameToDocNameKeyMap: { [key: string]: string } = {
//   'AdminAadhaarS1Verified': 'Admin_AadhaarS1_Verification_Clarification',
//   'AdminAadhaarS2Verified': 'Admin_AadhaarS2_Verification_Clarification',
//   'AdminPanVerified': 'Admin_Pan_Verification_Clarification',
//   'AdminGSTVerified': 'Admin_GST_Verification_Clarification',
//   // Add more mappings as needed
// };

// export const rejectDocumentInternal = async (
//   _flag: string,
//   status: string,
//   id: string,
//   clarification: string
// ): Promise<[boolean, any]> => {
//   try {
//     // Validate the input filename
//     if (!filenameToDocNameKeyMap.hasOwnProperty(filename)) {
//       throw new Error('Invalid filename');
//     }

//     // Get docNameKey from the map
//     const docNameKey = filenameToDocNameKeyMap[filename];

//     // Prepare update data with specified properties
//     const updateData = {
//       [filename]: status,
//       [docNameKey]: clarification,
//     };

//     // Find and update the document in the UserKYC1 collection
//     const result = await UserKYC1.findOneAndUpdate(
//       { user: id },
//       updateData,
//       { new: true }
//     );

//     if (!result) {
//       throw new Error('Document update failed');
//     }

//     return [true, result];
//   } catch (error) {
//     return [false, error.message || 'Unknown error occurred'];
//   }
// };

export const getAllActivitiesInternal = async (id): Promise<any[]> => {
  try {
    
    const result = await UserKYC1.find({ user: id })
    const activitiesArray = result.map(item => item.activities);
   
    return [true, activitiesArray];
  } catch (error) {
  
    return [false, error];
  }
};


