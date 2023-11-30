import mongoose, { Document, Schema, Model, Types } from "mongoose";

// Define the interface for the document
interface IwalletTransaction extends Document {
  walletID: Types.ObjectId | IUser;
  BankBalanceAmount:number;
  futurerecievable:number
  paidBy: Types.ObjectId | IUser;
  paidto: Types.ObjectId | IUser;
  paymentype: "debit" | "credit" ;
  paymentstatus: "hold" | "fd" | "rejected" | "proccessed";
  updated_at:Date
}

// Define the reference interface for the user field
interface IUser extends Document {
  _id: Types.ObjectId;
}
// Define the schema
const Wallettransactionschema: Schema<IwalletTransaction> = new Schema({
    walletID: {
        type: Schema.Types.ObjectId,
        ref: "walletmodel",
      },
      paidBy: {
        type: Schema.Types.ObjectId,
        ref: "RegisterUser",
      },
      paidto: {
        type: Schema.Types.ObjectId,
        ref: "RegisterUser",
      },
      paymentype: {
        type: String,
        enum: ["debit", "credit"],
      },
      paymentstatus: {
        type: String,
        enum: ["hold", "fd","rejected","proccessed"],
      },
      BankBalanceAmount: { type: Number},
      futurerecievable: { type: Number},
      updated_at: { type: Date, default: Date.now },
});
// Define the model
const Wallettransaction: Model<IwalletTransaction> = mongoose.model<IwalletTransaction>(
  "wallettransaction",
  Wallettransactionschema
);

export default Wallettransaction;
