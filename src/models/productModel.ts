import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// Define the interface for the document
interface IReferralCode extends Document {
  productName: String;
  categoryIds: String[];
  productStatus: String;
  updated_at: Date;
}

// Define the schema
const ProductSchema: Schema<IReferralCode> = new Schema<IReferralCode>({
    productName: {
    type: String,
    required: true
  },
  updated_at: { type: Date, default: Date.now },
  categoryIds: {
    type: [String],
    default: [],
    required: true
  },
  productStatus: {
    type: String,
    default: "active",
    required: true
  }
},
  {
  versionKey : false
  }
);

const productModel: Model<IReferralCode> = mongoose.model<IReferralCode>('product', ProductSchema);

export default productModel;
