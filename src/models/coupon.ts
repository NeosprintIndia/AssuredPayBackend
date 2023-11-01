import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// Define the interface for the document
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
  usedBy: String[]
}

// Define the schema
const CouponCodeSchema: Schema<IReferralCode> = new Schema<IReferralCode>({
  code: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: '',
    required: true
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
    required: true
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
