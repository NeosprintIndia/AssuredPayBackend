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
    validate: {
      validator: function (value: string) {
        // Use a case-insensitive regular expression to check minimum length
        return /^[a-zA-Z0-9]{4,}$/.test(value);
      },
      message: "Username must be at least 4 characters long and can only contain letters and numbers.",
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
    enum: ["Admin", "Business_User", "Maker","Checker", "affiliatePartner", "affiliateSales"],
    required: true,
  },
  forgotpasswordotp:{type: String},
  
  MFA: {
    type: String,
  }
});

// Define the model
const User: Model<IRegisterUser> = mongoose.model<IRegisterUser>("RegisterUser", RegisterUserSchema);

export default User;
