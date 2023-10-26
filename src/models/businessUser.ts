import mongoose, { Schema, Document, Model,Types } from 'mongoose';

// Define the interface for the BusinessUser document
interface IBusinessUser extends Document {
  userId: mongoose.Types.ObjectId | IUser; // Replace 'IUser' with the correct user interface
  refferedBy: string;
  PAN_Attempt: number;
  GST_Attempt: number;
  Aadhaar_Attempt: number;
  cin: number;
  mobileotp:string;
  emailotp: string;
  isemailotpverified:boolean;
  ismobileotpverified:boolean
  // Additional business user-specific fields
}

// Define the reference interface for the user field
interface IUser extends Document {
  _id: Types.ObjectId;
}


// Create the schema for the BusinessUser
const BusinessUserSchema: Schema<IBusinessUser> = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  refferedBy: String,
  PAN_Attempt: Number,
  GST_Attempt: Number,
  Aadhaar_Attempt: Number,
  cin: Number,
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
  // Additional business user-specific fields
});

// Create the model for BusinessUser
const BusinessUser: Model<IBusinessUser> = mongoose.model<IBusinessUser>('BusinessUser', BusinessUserSchema);

export default BusinessUser;
