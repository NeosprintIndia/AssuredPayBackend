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
  otp: string;
  MFA: string;
  refferedBy: string;
  comparePassword(candidatePassword: string): boolean;
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
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (value: string) {
        return value.length >= 4;
      },
      message: "Username must be at least 4 characters long.",
    },
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
    default: "Business_User",
  },
  otp: {
    type: String,
  },
  MFA: {
    type: String,
  },
  refferedBy: { type: String, default: "" }
});

// Define the model
const User: Model<IRegisterUser> = mongoose.model<IRegisterUser>("RegisterUser", RegisterUserSchema);

export default User;
