import mongoose, { Schema, Document, Model } from 'mongoose';

// Define the interface for the document
interface IRegisterUser extends Document {
  business_email: string;
  business_mobile: string;
  username: string;
  password: string;
  oldPasswords: string[];
  createdAt: Date;
  lastActive?: string;
  active: boolean;
  role: string;
  forgotpasswordotp:string;
  MFA: string;
}

// Define the schema
const RegisterUserSchema: Schema<IRegisterUser> = new Schema({
  business_email: {
    type: String,
    required: true
  },
  business_mobile: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true, // Convert username to lowercase
    minlength: [4, "Username must be at least 4 characters long."], // Enforce minimum length
  },
  password: { type: String, required: true },
  oldPasswords: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  lastActive: {
    type: String,
    required: false,
  },
  active: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ["Admin", "Business_User", "Maker","Checker", "affiliatePartner", "affiliateSales"],
    required: true,
  },
  forgotpasswordotp:{type: String},
  
  MFA: {
    type: String,
  }
});

// Define the model
const User: Model<IRegisterUser> = mongoose.model<IRegisterUser>("RegisterUsers", RegisterUserSchema);

export default User;
