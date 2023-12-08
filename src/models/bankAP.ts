import mongoose, { Schema, Document, Model, Types } from 'mongoose';


interface BankSeed extends Document {
  bankName: String;
  updated_at:Date;
}

// Define the schema
const BankDetailSeed: Schema<BankSeed> = new Schema<BankSeed>({
    bankName: {
    type: String,
  },
  updated_at: { type: Date, default: Date.now },
},
);

const BankSeed: Model<BankSeed> = mongoose.model<BankSeed>('BankSeed', BankDetailSeed);

export default BankSeed;
