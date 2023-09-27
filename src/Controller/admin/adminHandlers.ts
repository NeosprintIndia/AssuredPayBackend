import UserKYC1 from '../../models/userKYCs'; // Import your UserKYC1 model
import adminGlobalSetting from "../../models/globalAdminSettings";



// Function to retrieve all KYC records
export const getAllKYCRecordsInternal = async (): Promise<any[]> => {
  try {
    const result = await UserKYC1.find()
      .select({ Legal_Name_of_Business: 1, GSTIN_of_the_entity: 1, due: 1, createdAt: 1 })
      .populate('user', 'refferedBy');
    return [true, result];
  } catch (error) {
    return [false, error];
  }
};

export const setLimitInternal = async (
  gstLimit: number,
  aadharLimit: number,
  panLimit: number,
  cin: number,
  termsOfService: string,
  privacyPolicy: string,
  disclaimer: string,
  enrollmentFees: number): Promise<any> => {
  try {
    const limitUpdate = {
      // You can initialize with default values or an empty object
    };

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

    const updated = await adminGlobalSetting.findOneAndUpdate(
      { id: "globalSetting" },
      {
        $set: limitUpdate
      },
      { new: true });
    return [true, updated];
  } catch (error) {
    return error;
  }
};

export const getAllConfigurationInternal = async (): Promise<any[]> => {
  try {
    const result = await adminGlobalSetting.find();

   // const resultObject = result.flat()
    console.log("GET ALL KYC ",result)
    return [true, result[0]];
  } catch (error) {
    return error;
  }
};

export const getuserbusinessdetailInternal = async (id): Promise<any[]> => {
  try {
    const result = await UserKYC1.find({ user: id }).select({ Constituion_of_Business: 1, Taxpayer_Type: 1, GSTIN_of_the_entity: 1, State: 1, Business_PAN: 1, Date_of_Registration: 1, Nature_of_Place_of_Business: 1, Trade_Name: 1, Place_of_Business: 1, Nature_of_Business_Activity: 1, GSTFILE: 1 })

    return [true, result];
  } catch (error) {
    return [false, error];
  }
};

export const getbusinessrepresentativedetailInternal = async (id): Promise<any[]> => {
  try {
    const result = await UserKYC1.find({ user: id }).select({ aadharNumber: 1, aadharCO: 1, aadharDOB: 1, aadharGender: 1, nameInAadhaar: 1, aadharPhotoLink: 1, aadharCountry: 1, distInAadhar: 1, aadharHouse: 1, aadharPincode: 1, aadharPO: 1, aadharState: 1, aadharStreet: 1, aadharFileUrl: 1, aadharBackUrl: 1, PANFile: 1 })

    return [true, result];
  } catch (error) {
    return [false, error];
  }
};

export const finalstatusInternal = async (
  id: string,
  key: string
): Promise<any> => {
  try {

    const result = await UserKYC1.findOneAndUpdate(
      { user: id },
      { $set: { due: key } },
      { new: true }
    );

    return [true, result];
  } catch (error) {
    return error;
  }
};

export const approveDocumentInternal = async (
  _flag: any,
  status: string,
  id: string,

): Promise<any | null> => {
  try {
    const updateData = { [_flag]: status }; // Use dynamic property assignment
    const result = await UserKYC1.findOneAndUpdate(
      { user: id },
      updateData,
      { new: true }
    );
    console.log(result);
    return [true, result];
  } catch (error) {
    return [false, error];
  }
};

export const rejectDocumentInternal = async (
 
  filename: string,
  status: string,
  id: string,
  docNameKey: string,
  clarification: string
): Promise<any | null> => {
  try {

    const updateData = { [filename]: status ,[docNameKey]:clarification};
    const result = await UserKYC1.findOneAndUpdate(
      { user: id },
      updateData, { new: true }
    );
    console.log(result);
    return [true, result];
  } catch (error) {
    return [false, error];
  }
};
//--------------------------------------------------------------------------------------

