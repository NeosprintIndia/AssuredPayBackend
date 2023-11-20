import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// Define the interface for the document
interface IReferralCode extends Document {
  categoryName: String;
  industryIds: String[];
  categoryStatus: String;
  updated_at:Date;
}

// Define the schema
const CategorySchema: Schema<IReferralCode> = new Schema<IReferralCode>({
    categoryName: {
    type: String,
    required: true
  },
  updated_at: { type: Date, default: Date.now },
  industryIds: {
    type: [String],
    default: [],
    required: true
  },
  categoryStatus: {
    type: String,
    default: "active",
    required: true
  }
},
  {
  versionKey : false
  }
);

const categoryModel: Model<IReferralCode> = mongoose.model<IReferralCode>('category', CategorySchema);

export default categoryModel;
