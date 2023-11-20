import mongoose, { Schema, Document, Model, Types } from 'mongoose';


interface IAffiliate extends Document {
  Paidby: Types.ObjectId | IUser,
  Paidto: Types.ObjectId | IUser,
  Paidfor:Types.ObjectId | IUser,
  bankAccountNumber: string;
  paymentMode: string;
  amount: number;
  utrRef: string;
  date: Date;
  transactionId: string;
  remark: string;
  updated_at:Date
}

// Define the reference interface for the user field
interface IUser extends Document {
  _id: Types.ObjectId;
}
// Define the schema
const AffiliateSettlementSchema: Schema<IAffiliate> = new Schema<IAffiliate>({
    Paidby: { type: Types.ObjectId,
        ref: "RegisterUser",
    },
    Paidto: { type: Types.ObjectId,
        ref: "RegisterUser",
    },
    Paidfor: { type: Types.ObjectId,
      ref: "RegisterUser",
  },
    bankAccountNumber: {
      type: String
    },
    paymentMode: {
      type: String
    },
    amount: {
      type: Number
    },
    utrRef: {
      type: String
    },
    updated_at: { type: Date, default: Date.now },
    date: {
      type: Date
    },
    transactionId: {
      type: String
    },
    remark: {
      type: String
    }
},
  {
  versionKey : false
  }
);

const affiliateModel: Model<IAffiliate> = mongoose.model<IAffiliate>('AffiliateSettlement', AffiliateSettlementSchema);

export default affiliateModel;
