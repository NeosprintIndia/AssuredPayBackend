import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// Define the interface for the document
interface IReferralCode extends Document {
    gstLimit: number;
    aadharLimit: number;
    panLimit: number;
    enrollmentFees: number;
    cin: number;
    termsOfService: string;
    privacyPolicy: string;
    disclaimer: string;
    buyerfeePercentageRecieveable: number;
    buyerpaymentRequestDuration: number;
    sellerfeePercentageRecieveable: number;
    sellerpaymentRequestDuration: number;
    refferalCommission:number;
    commissionEligibility:number;

}

// Define the reference interface for the user field
interface IUser extends Document { _id: Types.ObjectId; }

// Define the schema
const globalSettingSchema: Schema<IReferralCode> = new Schema<IReferralCode>({

    gstLimit: {
        type: Number,
        default: 3,

    },
    aadharLimit: {
        type: Number,
        default: 3,

    },
    panLimit: {
        type: Number,
        default: 3,

    },
    cin: {
        type: Number,
        default: 3,

    },
    enrollmentFees: {
        type: Number,
        default: 50000,

    },
    termsOfService: {
        type: String, default: "",
    },
    privacyPolicy: {
        type: String, default: "",
    },
    disclaimer: {
        type: String,
        default: "",
    },
    buyerfeePercentageRecieveable: {
        type: Number,
        default: 0,

    },
    buyerpaymentRequestDuration: {
        type: Number,
        default: 1,

    },
    sellerfeePercentageRecieveable: {
        type: Number,
        default: 0,

    },
    sellerpaymentRequestDuration: {
        type: Number,
        default: 1,

    },
    refferalCommission: {
        type: Number,
        default: 1,

    },
    commissionEligibility: {
        type: Number,
        default: 1,

    },

});

// Define the model
const adminGlobalSetting: Model<IReferralCode> = mongoose.model<IReferralCode>('globalSettingSchema', globalSettingSchema);

export default adminGlobalSetting;
