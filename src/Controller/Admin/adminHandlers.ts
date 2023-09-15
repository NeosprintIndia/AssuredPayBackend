import UserKYC1 from '../../Models/userKYCs'; // Import your UserKYC1 model


// Function to retrieve all KYC records
export const getAllKYCRecordsInternal = async (): Promise<any[]> => {
  try {
    const result = await UserKYC1.find();
    console.log(result);
    return result;
  } catch (error) {
    throw error;
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
        { $set: { AdminAadhaarS1Verified: adminAadhaarS1Verified } }
      );
      console.log(result);
      return result;
    } catch (error) {
      throw error;
    }
  };