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
  userName : String,
  email: String,
  phoneNumber: Number,
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
// Define the schema
const AffiliateSchema: Schema<IAffiliate> = new Schema<IAffiliate>({
    userName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phoneNumber :{
    type: Number,
    required: true
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
