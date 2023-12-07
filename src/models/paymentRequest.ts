import { Schema, Document, Model, model, Types } from "mongoose";

interface IPaymentRequest extends Document {
  createdby: Types.ObjectId | IUser;
  requester: Types.ObjectId | IUser; // Reference to the user making the request
  paidTo: Types.ObjectId | IUser;
  paidBy: Types.ObjectId | IUser;
  recipient: Types.ObjectId | IUser; // Reference to the user receiving the payment
  orderID: string; // Reference to the order associated with the payment
  paymentType: "full" | "partial";
  checkerStatus: "pending" | "approved" | "rejected";
  recipientStatus: "pending" | "approved" | "rejected";
  remark: string;
  orderTitle: string;
  POPI: string;
  orderAmount: number;
  proposalCreatedDate: Number;
  updated_at: Date;
  proposalStatus: string,
  proposalValidity: number;
  proposalExpireDate: Number;
  paymentIndentifier: "buyer" | "seller";
  paymentDays?: number; // Number of days for full payment
  MilestoneDetails?: Array<{
    date: Number; // Date when the partial payment should be made
    days: Number
    isFDAllowed: string
    ApproxInterest: number
    amount: number; // Amount to be paid on that date
    balancedUsed: number; //Bank balance if used
    balancedUsedStatus: string; 
    recievableUsed: number; // Amount of recievable used
    recievablewhichpr: Types.ObjectId | IUser; // recievable of which payment request // think from Paidby user
    recievablewhichms: Types.ObjectId | IUser; // recievable of which milestone of above payment request //think from Paidby user
    recievableUsedStatus: string;
    walletBalanceUsed: number;
    ApFees: number;
    utilisedbySeller: number;
    utilisedforpr: Types.ObjectId | IUser; // If this recievable is used by any other pr//think from Paidto user
    utilisedforms: Types.ObjectId | IUser; // If this recievable is used by any other milestone//think from Paidto user
    isBBFDAllowed: String
    isBBFDCreated: String
    isRCFDAllowed: String
    isRCFDCreated: String
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
    default: "active"
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
  proposalCreatedDate: {
    type: Number,
    default: Date.now
  },
  proposalValidity: {
    type: Number,

  },
  proposalExpireDate: {
    type: Number,
    default: Date.now

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
        required: false,
      },
      amount: {
        type: Number,
        required: false,
      },
      balancedUsed: {
        type: Number,

      },
      balancedUsedStatus: {
        type: String,

      },
      walletBalanceUsed: { type: Number, default: 0 },
      recievableUsed: {
        type: String,

      },
      recievablewhichpr: {
        type: Types.ObjectId,
        ref: "PaymentRequest",

      },
      recievablewhichms: {
        type: Types.ObjectId,
        ref: "PaymentRequest",

      },
      recievableUsedStatus: {
        type: Types.ObjectId,
        ref: "PaymentRequest",

      },
      isBBFDAllowed: {
        type: String,

      },
      isBBFDCreated: {
        type: String,

      },
      isRCFDAllowed: {
        type: String,

      },
      isRCFDCreated: {
        type: String,

      },
      ApproxInterest: {
        type: Number,
      },
      utilisedbySeller: {
        type: Number,

      },
      utilisedforpr: {
        type: Types.ObjectId,
        ref: "PaymentRequest",
      },
      utilisedforms: {
        type: Types.ObjectId,
        ref: "PaymentRequest",
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
