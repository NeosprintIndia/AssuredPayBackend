import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// Define the interface for the document
interface IReferralCode extends Document {
  industryName: String;
  industryStatus: String;
  updated_at: Date;
}

// Define the schema
const IndustrySchema: Schema<IReferralCode> = new Schema<IReferralCode>({
    industryName: {
    type: String,
    required: true
  },
  updated_at: { type: Date, default: Date.now },
  industryStatus: {
    type: String,
    default: "active",
    required: true
  }
},
  {
  versionKey : false
  }
);

const industryModel: Model<IReferralCode> = mongoose.model<IReferralCode>('industry', IndustrySchema);

export default industryModel;
