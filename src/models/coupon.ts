import mongoose, { Schema, Document, Model, Types } from 'mongoose';

interface IReferralCode extends Document {
  code: String;
  description: String;
  status: String;
  createdOn: Date;
  expiryDate: Date;
  maxUseLimit : Number,
  discount : {prop:String},
  validFor: String,
  usage: Number,
  usedBy: String[],
  updated_at:Date;
}


const CouponCodeSchema: Schema<IReferralCode> = new Schema<IReferralCode>({
  code: {
    type: String,
    required: true
  },
  updated_at: { type: Date, default: Date.now },
  description: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    default: "active", 
    enum: ["active", "expired"]
  },
  createdOn: {
    type: Date,
    default: new Date()
  },
  expiryDate: {
    type: Date,
    required: true
  },
  maxUseLimit: {
    type: Number,
    required: true,
    default:10000,
  },
  discount: {
    type: Object,
    required: true
  },
  validFor: {
    type: String,
    required: true
  },
  usage:{
    type: Number,
    default: 0
  },
  usedBy:{
    type: [String],
    default: []
  }
},
  {
  versionKey : false
  }
);
const couponModel: Model<IReferralCode> = mongoose.model<IReferralCode>('coupon', CouponCodeSchema);

export default couponModel;
