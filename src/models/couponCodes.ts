import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// Define the interface for the document
interface IReferralCode extends Document {
  user: Types.ObjectId | IUser;
  coupon_code: string;
discountPercentage: number;
}

// Define the reference interface for the user field
interface IUser extends Document {
  _id: Types.ObjectId;
}

// Define the schema
const CouponCodeSchema: Schema<IReferralCode> = new Schema<IReferralCode>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'RegisterUser',
  },
  coupon_code: {
    type: String,
    default: '',
  },
  discountPercentage: {
    type: Number,
    default: 0,
  },
});

// Define the model
const User_Discount_Code: Model<IReferralCode> = mongoose.model<IReferralCode>('User_Coupon_Code', CouponCodeSchema);

export default User_Discount_Code;
