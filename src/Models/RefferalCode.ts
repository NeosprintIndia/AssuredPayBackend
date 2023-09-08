import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// Define the interface for the document
interface IReferralCode extends Document {
  user: Types.ObjectId | IUser;
  refferal_code: string;
  count: number;
}

// Define the reference interface for the user field
interface IUser extends Document {
  _id: Types.ObjectId;
}

// Define the schema
const ReferralCodeSchema: Schema<IReferralCode> = new Schema<IReferralCode>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'RegisterUser',
  },
  refferal_code: {
    type: String,
    default: '',
  },
  count: {
    type: Number,
    default: 0,
  },
});

// Define the model
const User_Referral_Code: Model<IReferralCode> = mongoose.model<IReferralCode>('User_Refer_Code', ReferralCodeSchema);

export default User_Referral_Code;
