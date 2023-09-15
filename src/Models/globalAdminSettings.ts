// import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// // Define the interface for the document
// interface IReferralCode extends Document {
// user: Types.ObjectId | IUser;
// gstLimit: number;
// aadharLimit: number;
// panLimit:number;
// enrollmentFees:number;
// cin:number;
// termsOfService:string;
// privacyPolicy:string;
// disclaimer:string;
// }  

// // Define the reference interface for the user field
// interface IUser extends Document { _id: Types.ObjectId; }

// // Define the schema
// const globalSettingSchema: Schema<IReferralCode> = new Schema<IReferralCode>({
//   user: {
//     type: Schema.Types.ObjectId,
//     ref: 'RegisterUser',
//   },
//   gstLimit: {
//     type: Number,
//   },
//   aadharLimit: {
//     type: Number,
// },
// panLimit: {
//     type: Number,
// },
// cin: {
//     type: Number,
// },
// enrollmentFees: {
//     type: Number,
// },
// termsOfService:{type:String},
// privacyPolicy:{type:String},
// disclaimer:{type:String},

// });

// // Define the model
// const adminGlobalSetting: Model<IReferralCode> = mongoose.model<IReferralCode>('User_Coupon_Code', globalSettingSchema);

// export default adminGlobalSetting;
