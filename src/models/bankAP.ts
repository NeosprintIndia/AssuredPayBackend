import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// Define the interface for the document
interface BankSeed extends Document {
  bankName: String;
}

// Define the schema
const BankDetailSeed: Schema<BankSeed> = new Schema<BankSeed>({
    bankName: {
    type: String,
  },
},
);

const BankSeed: Model<BankSeed> = mongoose.model<BankSeed>('BankSeed', BankDetailSeed);

export default BankSeed;
