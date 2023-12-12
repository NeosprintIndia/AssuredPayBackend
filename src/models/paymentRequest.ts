import { Schema, Document, Model, model, Types } from "mongoose";

interface IPaymentRequest extends Document {
  createdby: Types.ObjectId | IUser;
  requester: Types.ObjectId | IUser; 
  paidTo: Types.ObjectId | IUser;
  paidBy: Types.ObjectId | IUser;
  recipient: Types.ObjectId | IUser; 
  orderID: string;
  orderStatus:"inProcess"|"withdraw"|"rejected"|"complete"|"expired";
  paymentCombination:"BB"|"RC"|"MIX";
  paymentType: "full" | "partial";
  checkerStatus: "pending" | "approved" | "rejected";
  recipientStatus: "pending" | "approved" | "rejected";
  remark: string;
  orderTitle: string;
  POPI: string;
  orderAmount: number;
  proposalCreatedDate: Date;
  updated_at: Date;
  proposalStatus: string,
  proposalValidity: number;
  proposalExpireDate: Number;
  paymentIndentifier: "buyer" | "seller";
  paymentDays?: number; 
  MilestoneDetails?: Array<{
    date: Number; 
    days: Number;
    milestoneStatus:"inProcess"|"completed"
    isFDAllowed: string
    ApproxInterest: number
    amount: number;
    balancedUsed: number; 
    balancedUsedStatus: string; 
    recievableUsed: number; 
    recievablewhichpr: Types.ObjectId | IUser; 
    recievablewhichms: Types.ObjectId | IUser;
    recievableUsedStatus: string;
    walletBalanceUsed: number;
    ApFees: number;
    utilisedbySeller: number;
    utilisedforpr: Types.ObjectId | IUser;
    utilisedforms: Types.ObjectId | IUser;
    isBBFDAllowed: String
    isBBFDCreated: String
    isRCFDAllowed: String
    isRCFDCreated: String
  }>;
}


interface IUser extends Document {
  _id: Types.ObjectId;
}

const paymentRequestSchema = new Schema<IPaymentRequest>({
  createdby: {
    type: Types.ObjectId,
    ref: "RegisterUsers", 
    required: true,
  },
  requester: {
    type: Types.ObjectId,
    ref: "RegisterUsers",
    required: true,
  },
  paidTo: {
    type: Types.ObjectId,
    ref: "RegisterUsers", 
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
  paymentCombination: {
    type: String,
    enum: ["BB", "RC","MIX"],
  },
  orderStatus: {
    type: String,
    enum: ["inProcess", "rejected","complete","expired"],
    default: "inProcess",
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
    type: Date,
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
     milestoneStatus: {
        type: String,
        enum: ["inProcess", "completed"],
        default: "inProcess",
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
