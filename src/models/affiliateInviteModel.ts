import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// Define the interface for the document

interface IAffiliate extends Document {
  affiliateId : String,
  businessStatus: String,
  businessSignupStatus: Boolean,
  businessOnboardedStatus: Boolean,
  businessEscrowOpenedStatus: Boolean,
  businessConvertedStatus: Boolean,
  businessInvitedThrough: String,
  businessInvitedMail: String,
  businessInvitedNumber: String,
  commissionWhileInviting:number
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
    required: false
  },
  businessSignupStatus: {
    type: Boolean,
    default:false
  },
  businessOnboardedStatus: {
    type: Boolean,
    default:false
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
    type: String,
    required: true
  }, 
  businessInvitedMail:{
    type: String
  },
  businessInvitedNumber: {
    type: String
  },
  commissionWhileInviting: {
    type: Number
  },

},
  {
  versionKey : false
  }
);

const affiliateInviteModel: Model<IAffiliate> = mongoose.model<IAffiliate>('affiliateInvite', AffiliateInviteSchema);

export default affiliateInviteModel;
