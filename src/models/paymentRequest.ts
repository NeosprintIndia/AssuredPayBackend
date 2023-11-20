import { Schema, Document, Model, model, Types } from "mongoose";

interface IPaymentRequest extends Document {
  createdby: Types.ObjectId | IUser;
  requester: Types.ObjectId | IUser; // Reference to the user making the request
  paidTo:Types.ObjectId | IUser;
  paidBy:Types.ObjectId | IUser;
  recipient: Types.ObjectId | IUser; // Reference to the user receiving the payment
  orderID: string; // Reference to the order associated with the payment
  paymentType: "full" | "partial";
  checkerStatus: "pending" | "approved" | "rejected";
  recipientStatus: "pending" | "approved" | "rejected";
  remark:string;
  orderTitle: string;
  POPI: string;
  orderAmount: number;
  proposalCreatedDate: Number;
  updated_at: Date;
  proposalStatus:string,
  proposalValidity: number;
  proposalExpireDate: Number;
  paymentIndentifier: "buyer" | "seller";
  paymentDays?: number; // Number of days for full payment
  MilestoneDetails?: Array<{
    date: Number; // Date when the partial payment should be made
    days:Number
    isFDAllowed:string
    ApproxInterest:number
    amount: number; // Amount to be paid on that date
    balancedUsed: number; //Bank balance if used
    recievableUsed:number;
    ApFees:number;
  }>;
}

// Define the reference interface for the user field
interface IUser extends Document {
  _id: Types.ObjectId;
}

const paymentRequestSchema = new Schema<IPaymentRequest>({
  createdby: {
    type: Types.ObjectId,
    ref: "RegisterUsers", // Assuming your User model is named 'User'
    required: true,
  },
  requester: {
    type: Types.ObjectId,
    ref: "RegisterUsers",
    required: true,
  },
  paidTo: {
    type: Types.ObjectId,
    ref: "RegisterUsers", // Assuming your User model is named 'User'
    required: true,
  },
  paidBy: {
    type: Types.ObjectId,
    ref: "RegisterUsers",
    required: true,
  },
  recipient: {
    type: Types.ObjectId,
    ref: "RegisterUsers",
    required: true,
  },
  updated_at: { type: Date, default: Date.now },
  orderID: {
    type: String,
  },
  proposalStatus: {
    type: String,
    enum: ["active", "expired"],
    default:"active"
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
  remark: {
    type: String,
    required: false,
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
  proposalCreatedDate:{ 
    type: Number,
    default: Date.now },
  proposalValidity: {
    type: Number,
    
  },
  proposalExpireDate: {
    type: Number,
    default:Date.now
   
  },
  paymentDays: {
    type: Number,
  },
  MilestoneDetails: [
    {
      date: {
        type: Date,
      },
      days: {
        type: Number,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      balancedUsed: {
        type: Number,
      
      },
      recievableUsed: {
        type: Number,
      
      },
      isFDAllowed: {
        type: String,
      
      },
      ApproxInterest: {
        type: Number,
     
      },
      ApFees: {
        type: Number,
       
      },
    },
  ],
});

const PaymentRequestModel: Model<IPaymentRequest> = model(
  "PaymentRequest",
  paymentRequestSchema
);

export default PaymentRequestModel;
