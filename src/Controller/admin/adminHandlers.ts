import UserKYC1 from '../../models/userKYCs'; // Import your UserKYC1 model
import Registration from "../../models/userRegisterations"
import adminGlobalSetting from "../../models/globalAdminSettings";


// Function to retrieve all KYC records based on sorting

export const getAllKYCRecordsInternal = async (
  page: number = 1, // Default value for the page number if not provided
  pageSize: number = 10, // Default value for the page size if not provided
  due: string | null = null, // Optional parameter for due status (null if not provided)
  search: string | null = null // Optional parameter for search query (null if not provided)
): Promise<any[]> => { // Function returns a promise that resolves to an array of any type
  try {
    // Calculate the number of records to skip based on the provided page number and page size
    const skipCount = (page - 1) * pageSize;

    // Build a query to retrieve specific fields from UserKYC1 collection and populate 'user' field with 'referredBy'
    let query = UserKYC1.find()
      .select({ Legal_Name_of_Business: 1, GSTIN_of_the_entity: 1, userRequestReference: 1, due: 1, kycrequested: 1 })
      .populate('user', 'referredBy');

    // Add conditions to the query based on the provided due status
    if (due !== null) {
      query = query.where('due').equals(due);
    }

    // Add search conditions to the query based on userRequestReference or GSTIN_of_the_entity
    if (search !== null) {
      query.or([
        { userRequestReference: search },
        { GSTIN_of_the_entity: search }
      ]);
    }

    // Execute the query with skip, limit, and retrieve the results
    const results: any[] = await query.skip(skipCount).limit(pageSize).exec();

    // Count the number of records with different due statuses for reporting
    const dueCounts = {
      approved: await UserKYC1.countDocuments({ due: 'Approved' }),
      rejected: await UserKYC1.countDocuments({ due: 'Rejected' }),
      new: await UserKYC1.countDocuments({ due: 'New' }),
      total: await UserKYC1.countDocuments(),
    };

   
    return [true, { results, dueCounts }];
  } catch (error) {
   
    return [false, error];
  }
};

// Function to update various limits and settings in the global admin configuration

export const setLimitInternal = async (
  gstLimit: number, // GST limit to be set
  aadharLimit: number, // Aadhar limit to be set
  panLimit: number, // PAN limit to be set
  cin: number, // CIN (Corporate Identification Number) limit to be set
  termsOfService: string, // Updated terms of service text
  privacyPolicy: string, // Updated privacy policy text
  disclaimer: string, // Updated disclaimer text
  enrollmentFees: number // Updated enrollment fees
): Promise<any> => {
  try {
    // Initialize an empty object to store the update values
    const limitUpdate = {};

    // Check and add provided limits and settings to the update object if they are not undefined
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

    // Find and update the global settings in the database based on the provided ID ("globalSetting")
    // Set the fields specified in limitUpdate with the provided values
    // Return the updated document after the update operation
    const updated = await adminGlobalSetting.findOneAndUpdate(
      { id: "globalSetting" }, // Find the document by its ID
      {
        $set: limitUpdate // Set the fields with the values provided in limitUpdate
      },
      { new: true } // Return the updated document after the update operation
    );

    // Prepare a new object with only the updated fields (exclude undefined values)
    const updatedFields = {};
    for (const key in limitUpdate) {
      if (limitUpdate.hasOwnProperty(key)) {
        updatedFields[key] = updated[key];
      }
    }

    // Return a tuple indicating success (true) and the updated fields
    return [true, updatedFields];

  } catch (error) {
    // If an error occurs during the update operation, return the error object
    return error;
  }
};

// Function to retrieve all configuration settings from the global admin configuration

export const getAllConfigurationInternal = async (): Promise<any[]> => {
  try {
    // Retrieve all documents from the adminGlobalSetting collection
    const result = await adminGlobalSetting.find();
   
    // The function assumes there is only one global configuration document, hence returning the first element
    return [true, result[0]];
  } catch (error) {
   
    return error;
  }
};

// Function to retrieve business details for a specific user from the UserKYC1 collection in the database
export const getuserbusinessdetailInternal = async (id): Promise<any[]> => {
  try {
    // Retrieve business details for the specified user ID from the UserKYC1 collection
    // Select specific fields to include in the result set
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
    });

    if (!result) {
      return [false, "User KYC data not found"];
    }
    const resultFiles = {
      GSTFILE: result?.GSTFILE || null,
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
    return [true, {resultFiles,restResult,fetchType}];
  } catch (error) {
  
    return [false, error];
  }
};

// Function to retrieve business representative details for a specific user from the UserKYC1 collection in the database

export const getbusinessrepresentativedetailInternal = async (id): Promise<any[]> => {
  try {
    // Retrieve specific business representative details for the specified user ID from the UserKYC1 collection
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

    return [true, { restResult, resultFiles, resultAadharPhoto, leftCount }];
  } catch (error) {
    return [false, error];
  }
};

export const finalstatusInternal = async (
  id: string,
  key: string
): Promise<any> => { 
  try {
    // Find the user document and select specific fields
    const user = await UserKYC1.findOne({ user: id })
    if(key==="Approved" && (user.AdminAadhaarS1Verified!="Approved" || user.AdminAadhaarS2Verified!="Approved" || user.AdminPanVerified!="Approved" || user.AdminGSTVerified!="Approved"))
    {
      return ([ true , "Please make sure all documents are approved before final approval" ]);
    }

    if (!user) {
      return { success: false, error: "User not found." };
    }

    // Check if the activities array exists and has at least one element
    console.log(user)

    const lastElement = user.activities[user.activities.length - 1];
    console.log(lastElement)
    user.due=key;
    lastElement.Admin_AadhaarS1_Verification_Clarification=user.Admin_AadhaarS1_Verification_Clarification
    lastElement.Admin_AadhaarS2_Verification_Clarification=user.Admin_AadhaarS2_Verification_Clarification
    lastElement.Admin_Pan_Verification_Clarification=user.Admin_Pan_Verification_Clarification
    lastElement.Admin_GST_Verification_Clarification=user.Admin_GST_Verification_Clarification
  
    const result =await user.save();

    console.log(result)
    return ([ true , "result" ]);
  } catch (error) {
    return { success: false, error: "An error occurred during the update." };
  }
};

// Function to update document approval status in the UserKYC1 collection based on provided parameters

export const approveDocumentInternal = async (
  _flag: any, // Dynamic property name used for the update operation
  status: string, // Status to be set for the specified _flag property
  id: string, // User ID for whom the document approval status needs to be updated
): Promise<any | null> => {
  try {
    // Prepare an object with a dynamic property assignment to update the specified _flag property with the provided status
    const updateData = { [_flag]: status };
    
    // Find and update the document in the UserKYC1 collection with the specified user ID
    // Set the specified _flag property with the provided status and return the updated document
    const result = await UserKYC1.findOneAndUpdate(
      { user: id }, // Find the document by its user ID
      updateData, // Set the dynamic property (_flag) with the provided status
      { new: true } // Return the updated document after the update operation
    );
   
    return [true, result];
  } catch (error) {
   
    return [false, error];
  }
};

// Function to reject a document in the UserKYC1 collection based on provided parameters
export const rejectDocumentInternal = async (
  filename: string, // Filename of the document being rejected
  status: string, // Status indicating rejection
  id: string, // User ID for whom the document rejection status needs to be updated
  docNameKey: string, // Key representing the type of document being rejected
  clarification: string // Clarification or reason for document rejection
): Promise<any | null> => {
  try {
    // Prepare an object with dynamic property assignments to update the specified properties (filename and docNameKey)
    // Set the specified filename property with the provided status and the specified docNameKey with the provided clarification
    const updateData = { [filename]: status, [docNameKey]: clarification };

    // Find and update the document in the UserKYC1 collection with the specified user ID
    // Set the specified filename property with the provided status and docNameKey with the provided clarification
    // Return the updated document after the update operation
    const result = await UserKYC1.findOneAndUpdate(
      { user: id }, // Find the document by its user ID
      updateData, // Set the dynamic properties (filename and docNameKey) with provided values
      { new: true } // Return the updated document after the update operation
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
    // Retrieve business user activities for the specified user ID from the UserKYC1 collection
    // Select specific fields to include in the result set
    const result = await UserKYC1.find({ user: id })
    const activitiesArray = result.map(item => item.activities);
     console.log("RESULT FOR ACTIVITY",activitiesArray)
    return [true, activitiesArray];
  } catch (error) {
  
    return [false, error];
  }
};


