import mongoose, { Schema, Document, Model, Types } from 'mongoose';
interface IRCFD extends Document {
  paymentRequest: Types.ObjectId | IUser;
  milestoneDetails: Types.ObjectId| IUser;
  getrcdate:Date;
  creationDate: Date;
  endDate: Date;
  amount: number;
  recievablewhichpr:Types.ObjectId | IUser;
  recievablewhichms:Types.ObjectId | IUser;
  eliglibleforInterest:string;
}

interface IUser extends Document {_id: Types.ObjectId }
const rcfdSchema = new Schema<IRCFD>({
  paymentRequest: {
    type: Types.ObjectId,
    ref: "PaymentRequest",
    required: true,
  },
  milestoneDetails: {
    type: Types.ObjectId,
    ref: "PaymentRequest.MilestoneDetails", // Reference to the MilestoneDetails in the PaymentRequest
    required: true,
  },
  recievablewhichpr: {
    type: Types.ObjectId,
    ref: "PaymentRequest",

  },
  recievablewhichms: {
    type: Types.ObjectId,
    ref: "PaymentRequest",

  },
  creationDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  getrcdate:{
    type: Date,
  },
  amount: {
    type: Number,
  },
  eliglibleforInterest: {
    type: String,
  },
});

const RCFD = mongoose.model<IRCFD>('RCFD', rcfdSchema);
export default RCFD;