import mongoose, { Document, Schema, Model, Types } from "mongoose";

// Define the interface for the document
interface IwallentModel extends Document {
  userId: Types.ObjectId | IUser;
  amount: number;
  credit: number;
  debit: number;
  updated_at:Date
}

// Define the reference interface for the user field
interface IUser extends Document {
  _id: Types.ObjectId;
}
// Define the schema
const Walletschema: Schema<IwallentModel> = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "RegisterUser",
      },
      amount: { type: Number, default: 0 },
      credit: { type: Number, default: 0 },
      debit: { type: Number, default: 0 },
      updated_at: { type: Date, default: Date.now },
});
// Define the model
const Wallet: Model<IwallentModel> = mongoose.model<IwallentModel>(
  "walletmodel",
  Walletschema
);

export default Wallet;
