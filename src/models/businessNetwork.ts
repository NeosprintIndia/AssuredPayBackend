import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// Define the interface for the document
interface IReferralCode extends Document {
  userId : Types.ObjectId | IUser,
  businessId: Types.ObjectId | IUser,
  status: String,
  favourite: Boolean
  gst: String
}
interface IUser extends Document {_id: Types.ObjectId }
// Define the schema
const BusinessNetworkSchema: Schema<IReferralCode> = new Schema<IReferralCode>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  businessId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  gst: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    default: "active"
  },
  favourite: {
    type: Boolean,
    default: false
  }
},
  {
  versionKey : false
  }
);

const businessNetworkModel: Model<IReferralCode> = mongoose.model<IReferralCode>('business_Network', BusinessNetworkSchema);

export default businessNetworkModel;
