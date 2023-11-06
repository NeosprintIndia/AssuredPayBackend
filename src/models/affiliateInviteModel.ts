import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// Define the interface for the document

interface IAffiliate extends Document {
  affiliateId : String,
  businessInvitedMail: String,
  businessInvitedNumber: String,
  invitedTimes: number 
  commissionWhileLastInviting: number
  date: Date, 
  businessStatus: String,
  businessStatusHistory: Object,
  commissionStatus: String
  businessSignupStatus: Boolean,
  businessInvitedThrough: String,
  //above listed properties we are using
  businessOnboardedStatus: Boolean,
  businessEscrowOpenedStatus: Boolean,
  businessConvertedStatus: Boolean,
  commissionEarned:number
  commissionSettle:number
 

}
// Define the schema
const AffiliateInviteSchema: Schema<IAffiliate> = new Schema<IAffiliate>({
    affiliateId: {
    type: String,
    required: true
  },
  businessStatus: {
    type: String,
    required: false, 
    default: "Not yet signed up"
  },
  businessSignupStatus: {
    type: Boolean,
    default:false
  },
  businessOnboardedStatus: {
    type: Boolean,
    default:false
  },
  invitedTimes:{
    type: Number,
    default: 1
  },
  commissionWhileLastInviting: {
    type: Number
  },
  date: {
    type: Date,
    default: new Date()
  },
  businessStatusHistory: {
    type: Object, 
    default: {}
  },
  commissionStatus: {
    type: String,
    default: "pending",
    enum: ["pending", "eligible", "settled"]
  },
  businessEscrowOpenedStatus: {
    type: Boolean,
    default:false
  },
  businessConvertedStatus: {
    type: Boolean,
    default:false
  },
  businessInvitedThrough :{
    type: String
  }, 
  businessInvitedMail:{
    type: String
  },
  businessInvitedNumber: {
    type: String
  },

},
  {
  versionKey : false
  }
);

const affiliateInviteModel: Model<IAffiliate> = mongoose.model<IAffiliate>('affiliateInvite', AffiliateInviteSchema);

export default affiliateInviteModel;
