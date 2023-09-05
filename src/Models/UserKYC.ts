const mongoose_kyc = require("mongoose");
const Schema=mongoose_kyc.Schema;
const UserKYCSchema = new mongoose_kyc.Schema({
    business_name: {
      type: String,
      default: '',
    },
    business_address: {
      type: String,
      default: '',
    },
    user:{
      type: Schema.Types.ObjectId,
      ref: 'RegisterUser'
  },
    business_bank_account_no: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      default: '',
    },
    district: {
      type: String,
      default: '',
    },
    state: {
      type: String,
      default: '',
    },
    postalCode: {
      type: String,
      default: '',
    },
    isGST: {
      type: Boolean,
    },
    GSTNumber: {
      type: String,
      default: '',
    },
    GSTFILE: {
      type: String,
      default: '',
    },
    PAN_Company_number: {
      type: String,
      default: '',
    },
    PANFile: {
      type: String,
      default: '',
    },
    aadharNumber: {
        type: String,
        default: '',
    },
    aadhar_ref_id:{ 
      type: String,
      default: '',
    },
    image_on_aadhaar: {
      type: String,
      default: '',
    },
    aadharFileUrl: {
      type: String,
      default: '',
    },
    aadharBackUrl: {
      type: String,
      default: '',
    },
    addressInAadhar: {
      type: String,
      default: '',
    },
    localityInAadhar: {
      type: String,
      default: '',
    },
    aadharpincode: {
      type: String,
      default: '',
    },
    cityInAadhar: {
      type: String,
      default: '',
    },
    distInAadhar: {
      type: String,
      default: '',
    },
    nameInAadhaar: {
      type: String,
    },
    selfie: [String], // Corrected array type
    shopImage: [String], // Corrected array type
    shopAddStatus: {
      type: String,
      default: '',
    },
    identityStatus: {
      type: String,
      default: '',
    },
    verificationStatus: {
      type: String,
      default: '',
    },
    finalStatus: {
      type: String,
      default: '', //'ask clarification'/'approved'
    },
    myDevices: {
      type: [Object], // Corrected array type
    },
  
    isAadhaarVerified: {
      type: Boolean,
      default: false,
    },
    isPANVerified: {
      type: Boolean,
      default: false,
    },
    isGSTVerified: {
      type: Boolean,
      default: false,
    },
    AdminAadhaarS1Verified: {
      type: Boolean,
      default: false,
    },
    Admin_AadhaarS1_Verification_Clarification: {
      type: String,
      default: false,
    },
    AdminAadhaarS2Verified: {
      type: Boolean,
      default: false,
    },
    Admin_AadhaarS2_Verification_Clarification: {
      type: String,
      default: false,
    },
    AdminPANVerified: {
      type: Boolean,
      default: false,
    },
    Admin_Pan_Verification_Clarification: {
      type: String,
      default: false,
    },
    PAN_Attempt: {
      type: Number,
      default: 0,
    },
    GST_Attempt: {
      type: Number,
      default: 0,
    },
    Aadhaar_Attempt: {
      type: Number,
      default: 0,
    },
    due: {
      type: String,
      default: "New",
    }
  }, {
    timestamps: true,
  });
  
  const UserKYC = mongoose_kyc.model('UserKYC', UserKYCSchema);
  
  module.exports = UserKYC;
  