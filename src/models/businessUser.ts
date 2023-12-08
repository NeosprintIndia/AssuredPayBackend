import mongoose, { Schema, Document, Model,Types } from 'mongoose';


interface IBusinessUser extends Document {
  userId: mongoose.Types.ObjectId | IUser; 
  kycId: mongoose.Types.ObjectId | IUser;
  refferedBy: string;
  PAN_Attempt: number;
  GST_Attempt: number;
  Aadhaar_Attempt: number;
  cin: number;
  mobileotp:string;
  emailotp: string;
  isemailotpverified:boolean;
  ismobileotpverified:boolean;
  updated_at:Date;
  
}

interface IUser extends Document {
  _id: Types.ObjectId;
}

const BusinessUserSchema: Schema<IBusinessUser> = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'RegisterUsers' },
  kycId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserKYC' },
  refferedBy: {type:String},
  PAN_Attempt: {type:Number},
  GST_Attempt: {type:Number},
  Aadhaar_Attempt: {type:Number},
  cin: {type:Number},
  emailotp: {
    type: String,
  },
  mobileotp: {
    type: String,
  },
  isemailotpverified: {
    type: Boolean,
    default: false,
  },
  ismobileotpverified: {
    type: Boolean,
    default: false,
  },
  updated_at: { type: Date, default: Date.now },
  
});


const BusinessUser: Model<IBusinessUser> = mongoose.model<IBusinessUser>('BusinessUser', BusinessUserSchema);

export default BusinessUser;
