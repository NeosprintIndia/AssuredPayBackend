import mongoose, { Document, Schema, Model, Types } from 'mongoose';

// Define the interface for the document
interface IUserKYC extends Document {
  business_name: string;
  business_address: string;
  user: Types.ObjectId | IUser;
  business_bank_account_no: string;
  city: string;
  district: string;
  state: string;
  postalCode: string;
  isGST: boolean;
  GSTNumber: string;
  GSTFILE: string;
  PAN_Company_number: string;
  PANFile: string;
  aadharNumber: string;
  aadhar_ref_id: string;
  image_on_aadhaar: string;
  aadharFileUrl: string;
  aadharBackUrl: string;
  addressInAadhar: string;
  localityInAadhar: string;
  aadharpincode: string;
  cityInAadhar: string;
  distInAadhar: string;
  nameInAadhaar: string;
  selfie: string[];
  shopImage: string[];
  shopAddStatus: string;
  identityStatus: string;
  verificationStatus: string;
  finalStatus: string;
  myDevices: object[];
  isAadhaarVerified: boolean;
  isPANVerified: boolean;
  isGSTVerified: boolean;
  isGSTDetailSave: boolean;
  AdminAadhaarS1Verified: boolean;
  Admin_AadhaarS1_Verification_Clarification: boolean;
  AdminAadhaarS2Verified: boolean;
  Admin_AadhaarS2_Verification_Clarification: boolean;
  AdminPANVerified: boolean;
  Admin_Pan_Verification_Clarification: boolean;
  PAN_Attempt: number;
  GST_Attempt: number;
  Aadhaar_Attempt: number;
  due: string;
  Constituion_of_Business:string;
  Taxpayer_Type:string;
  GSTIN_of_the_entity:string;
  Legal_Name_of_Business:string;
  Business_PAN:string;
  Date_of_Registration: Date;
  State:string;
  Trade_Name:string;
  Place_of_Business:string;
  Nature_of_Place_of_Business:string;
  Nature_of_Business_Activity:string;
  globalStatus:string;
  createdAt: Date;
  updatedAt: Date;
}

// Define the reference interface for the user field
interface IUser extends Document {
  _id: Types.ObjectId;
}

// Define the schema
const UserKYCSchema: Schema<IUserKYC> = new Schema<IUserKYC>({
  business_name: {
    type: String,
    default: '',
  },
  business_address: {
    type: String,
    default: '',
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'RegisterUser',
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
  aadhar_ref_id: {
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
  selfie: [String],
  shopImage: [String],
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
    type: [Object],
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
    type: Boolean,
    default: false,
  },
  AdminAadhaarS2Verified: {
    type: Boolean,
    default: false,
  },
  Admin_AadhaarS2_Verification_Clarification: {
    type: Boolean,
    default: false,
  },
  AdminPANVerified: {
    type: Boolean,
    default: false,
  },
  Admin_Pan_Verification_Clarification: {
    type: Boolean,
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
  globalStatus:{
    type: String,
    default:"GSTPG1",
},
  isGSTDetailSave:{type:Boolean,default:false},
  Constituion_of_Business:{type:String},
  Taxpayer_Type:{type:String},
  GSTIN_of_the_entity:{type:String},
  Legal_Name_of_Business:{type:String},
  Business_PAN:{type:String},
  Date_of_Registration: {Date},
  State:{type:String},
  Trade_Name:{type:String},
  Place_of_Business:{type:String},
  Nature_of_Place_of_Business:{type:String},
  Nature_of_Business_Activity:{type:String},
  due: {
    type: String,
    default: 'New',
  },
}, {
  timestamps: true,
});

// Define the model
const UserKYC: Model<IUserKYC> = mongoose.model<IUserKYC>('UserKYC', UserKYCSchema);

export default UserKYC;
