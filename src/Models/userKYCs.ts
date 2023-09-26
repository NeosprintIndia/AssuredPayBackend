import mongoose, { Document, Schema, Model, Types } from 'mongoose';

// Define the interface for the document
interface IUserKYC extends Document {
  user: Types.ObjectId | IUser;
 
 
 
 
  postalCode: string;
  isGST: boolean;
  GSTNumber: string;
  PAN_number: string;
  aadharFileUrl: string;
  aadharBackUrl: string;
  PANFile: string;
  GSTFILE: string;
  aadhar_ref_id: string;
  localityInAadhar: string;
  shopAddStatus: string;
  identityStatus: string;

  finalStatus: string;
  myDevices: object[];
  isPANVerified: string;
  isGSTVerified: string;
  isGSTDetailSave: boolean;
  isGSTDetailSaveManually:string;

  isAadharDetailSave: boolean;
  AdminAadhaarS1Verified: string;
  AdminAadhaarS2Verified: string;
 
  Admin_AadhaarS1_Verification_Clarification: string;
  Admin_AadhaarS2_Verification_Clarification: string;
  Admin_Pan_Verification_Clarification: string;
  due: string;
  Constituion_of_Business: string;
  Taxpayer_Type: string;
  GSTIN_of_the_entity: string;
  Legal_Name_of_Business: string;
  Business_PAN: string;
  Date_of_Registration: Date;
  State: string;
  Trade_Name: string;
  userRequestReference: string;
  Place_of_Business: string;
  Nature_of_Place_of_Business: string;
  Nature_of_Business_Activity: string;
  aadharNumber: string;
  aadharCO: string;
  aadharGender: string;
  nameInAadhaar: string;
  aadharDOB: string;
  aadharPhotoLink: string;
  aadharCountry: string;
  distInAadhar: string;
  aadharHouse: string;
  aadharPincode: string;
  aadharPO: string;
  aadharState: string;
  aadharStreet: string;
  aadharSubDistrict: string;
  cityInAadhar: string;
  addressInAadhar: string;
  globalStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define the reference interface for the user field
interface IUser extends Document {_id: Types.ObjectId }

// Define the schema
const UserKYCSchema: Schema<IUserKYC> = new Schema<IUserKYC>({
 
  
  user: {
    type: Schema.Types.ObjectId,
    ref: 'RegisterUser',
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
  PAN_number: {
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
  aadhar_ref_id: {
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
  aadharPincode: {
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
    default: ""
  },

  identityStatus: {
    type: String,
    default: '',
  },
 
  finalStatus: {
    type: String,
    default: '', //'ask clarification'/'approved'
  },
  myDevices: {
    type: [Object],
  },

  isPANVerified: {
    type: String,
    default: "Under_Review",
  },
  isGSTVerified: {
    type: String,
    default: "Under_Review",
  },
  AdminAadhaarS1Verified: {
    type: String,
    default: "Under_Review",
  },
  Admin_AadhaarS1_Verification_Clarification: {
    type: String,
    default: "Under_Review",
  },
  AdminAadhaarS2Verified: {
    type: String,
    default: "Under_Review",
  },
  Admin_AadhaarS2_Verification_Clarification: {
    type: String,
    default: "",
  },
  
  Admin_Pan_Verification_Clarification: {
    type: String,
    default: "",
  },
 
  globalStatus: {
    type: String,
    default: "GSTPG1",
  },
  userRequestReference: {
    type: String,
    default:""
  },
  isGSTDetailSaveManually: {
    type: String,
    default:""
  },
  aadharSubDistrict: { type: String },
  aadharStreet: { type: String },
  aadharState: { type: String },
  aadharPO: { type: String },
  aadharHouse: { type: String },
  aadharCountry: { type: String },
  aadharPhotoLink: { type: String },
  aadharDOB: { type: String },
  aadharCO: { type: String },
  aadharGender: { type: String },
  isAadharDetailSave: { type: Boolean, default: false },
  isGSTDetailSave: { type: Boolean, default: false },
  Constituion_of_Business: { type: String },
  Taxpayer_Type: { type: String },
  GSTIN_of_the_entity: { type: String },
  Legal_Name_of_Business: { type: String },
  Business_PAN: { type: String },
  Date_of_Registration: { Date },
  State: { type: String },
  Trade_Name: { type: String },
  Place_of_Business: { type: String },
  Nature_of_Place_of_Business: { type: String },
  Nature_of_Business_Activity: { type: String },
  due: {
    type: String,
    default: 'New'
  },
}, {
  timestamps: true,
});

// Define the model
const UserKYC: Model<IUserKYC> = mongoose.model<IUserKYC>('UserKYC', UserKYCSchema);

export default UserKYC;
