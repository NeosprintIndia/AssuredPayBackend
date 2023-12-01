import mongoose, { Schema, Document, Model, Types } from 'mongoose';
interface IBBFD extends Document {
  paymentRequest: Types.ObjectId | IUser;
  creationDate: Date;
  endDate: Date;
  amount: number;
}
interface IUser extends Document {_id: Types.ObjectId }

const bbfdSchema = new Schema<IBBFD>({
  paymentRequest: {
    type: Types.ObjectId,
    ref: "PaymentRequest",
    required: true,
  },
  creationDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  amount: {
    type: Number,
  },
});

const BBFD = mongoose.model<IBBFD>('BBFD', bbfdSchema);
export default BBFD;
