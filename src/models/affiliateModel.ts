import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// Define the interface for the document
interface ISettlement {
  bankAccountNumber: string;
  paymentMode: string;
  amount: number;
  utrRef: string;
  date: Date;
  transactionId: string;
}
interface IAffiliate extends Document {
  userId: Types.ObjectId | IUser
  type: String,
  referralCode: String,
  status: String,
  date: Date
  panNumber: String,
  panFirstName: String,
  panLastName: String,
  gstNumber: String,
  constituionOfBusiness: String, 
  taxpayerType: String, 
  gstDateOfRegistraion: Date, 
  legalNameOfBusiness: String, 
  businessPanNumber: String, 
  placeOfBusiness: String, 
  state: String,
  tradeName: String, 
  natureOFBusinessActivity: String,
  natureOfPlaceofBusiness: String ,
  settlement: ISettlement[];
  commissionEarned:number,
  commissionSettle:number

}

// Define the reference interface for the user field
interface IUser extends Document {
  _id: Types.ObjectId;
}
// Define the schema
const AffiliateSchema: Schema<IAffiliate> = new Schema<IAffiliate>({
  userId: { type: Types.ObjectId},
  type: {
    type: String,
    // required: true, 
    enum: ["individual", "businessFirm"] 
  },
  referralCode : {
    type: String,
    // required: true
  },
  status: {
    type: String,
    // required: true,
    default: "active"
  },
  date:{
    type: Date,
    required: true,
    default: new Date()
  },
  panNumber: {
    type: String
  },
  panFirstName :{
    type: String
  },
  panLastName :{
    type: String
  },
  gstNumber :{
    type: String
  },
  constituionOfBusiness :{
    type: String
  },
  taxpayerType :{
    type: String
  },
  gstDateOfRegistraion :{
    type: Date
  },
  legalNameOfBusiness :{
    type: String
  },
  businessPanNumber :{
    type: String
  },
  placeOfBusiness :{
    type: String
  },
  state :{
    type: String
  },
  tradeName :{
    type: String
  },
  natureOFBusinessActivity :{
    type: String
  },
  natureOfPlaceofBusiness :{
    type: String
  },
  commissionEarned: {
    type: Number
  },
  commissionSettle: {
    type: Number
  },
  settlement: [{
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
    date: {
      type: Date
    },
    transactionId: {
      type: String
    }
  }]
},
  {
  versionKey : false
  }
);

const affiliateModel: Model<IAffiliate> = mongoose.model<IAffiliate>('affiliate', AffiliateSchema);

export default affiliateModel;
