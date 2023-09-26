import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// Define the interface for the document
interface IReferralCode extends Document {
gstLimit: number;
aadharLimit: number;
panLimit:number;
enrollmentFees:number;
cin:number;
termsOfService:string;
privacyPolicy:string;
disclaimer:string;
id:string;
}  

// Define the reference interface for the user field
interface IUser extends Document { _id: Types.ObjectId; }

// Define the schema
const globalSettingSchema: Schema<IReferralCode> = new Schema<IReferralCode>({
 
  gstLimit: {
    type: Number,
    default:3
  },
  aadharLimit: {
    type: Number,
    default:3
},
panLimit: {
    type: Number,
    default:3
},
cin: {
    type: Number,
    default:3
},
enrollmentFees: {
    type: Number,
    default:50000
},
termsOfService:{type:String},
privacyPolicy:{type:String},
disclaimer:{type:String},
id:{type:String,
default:"globalSetting"}

});

// Define the model
const adminGlobalSetting: Model<IReferralCode> = mongoose.model<IReferralCode>('globalSettingSchema', globalSettingSchema);

export default adminGlobalSetting;
