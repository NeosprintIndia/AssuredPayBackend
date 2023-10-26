import { Schema, Document, Model, model, Types } from "mongoose";

interface IPaymentRequest extends Document {
  createdby: Types.ObjectId | IUser;
  requester: Types.ObjectId | IUser; // Reference to the user making the request
  recipient: Types.ObjectId | IUser; // Reference to the user receiving the payment
  orderID: string; // Reference to the order associated with the payment
  paymentType: "full" | "partial";
  checkerStatus: "pending" | "approved" | "rejected";
  recipientStatus: "pending" | "approved" | "rejected";
  orderTitle: string;
  POPI: string;
  orderAmount: number;
  proposalCreatedDate: Date;
  proposalValidity: number;
  proposalExpireDate: Date;
  paymentIndentifier: "buyer" | "seller";
  paymentDays?: number; // Number of days for full payment
  MilestoneDetails?: Array<{
    date: Date; // Date when the partial payment should be made
    amount: number; // Amount to be paid on that date
    balancedUsed: number; //Bank balance if used
    recievableUsed:number;
  }>;
}

// Define the reference interface for the user field
interface IUser extends Document {
  _id: Types.ObjectId;
}

const paymentRequestSchema = new Schema<IPaymentRequest>({
  createdby: {
    type: Types.ObjectId,
    ref: "User", // Assuming your User model is named 'User'
    required: true,
  },
  requester: {
    type: Types.ObjectId,
    ref: "User",
    required: true,
  },
  recipient: {
    type: Types.ObjectId,
    ref: "User",
    required: true,
  },
  orderID: {
    type: String,
  },
  paymentType: {
    type: String,
    enum: ["full", "partial"],
    required: true,
  },
  checkerStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    required: true,
  },
  recipientStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    required: true,
  },
  orderTitle: {
    type: String,
    required: true,
  },
  POPI: {
    type: String,
  },
  orderAmount: {
    type: Number,
    required: true,
  },
  paymentIndentifier: {
    type: String,
    enum: ["buyer", "seller"],
    required: true,
  },
  proposalCreatedDate: {
    type: Date,
 
  },
  proposalValidity: {
    type: Number,
    
  },
  proposalExpireDate: {
    type: Date,
   
  },
  paymentDays: {
    type: Number,
  },
  MilestoneDetails: [
    {
      date: {
        type: Date,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      balancedUsed: {
        type: Number,
        required: true,
      },
      recievableUsed: {
        type: Number,
        required: true,
      },
    },
  ],
});

const PaymentRequestModel: Model<IPaymentRequest> = model(
  "PaymentRequest",
  paymentRequestSchema
);

export default PaymentRequestModel;
