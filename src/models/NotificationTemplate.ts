import mongoose, { Schema, Document, Model } from 'mongoose';

// Define the interface for the document
interface IemailTemplates extends Document {
    createdOn: Date;
    Title: string;
    Subtitle: string;
    SLUG: string;
    For: string;
    Template_Name: string;
    Template_ID: string;
    Message: string;
    Length: number;
    Status: string;
    VAR_1: string;
    VAR_2: string;
    VAR_3: string;
    VAR_4: string;
    Subject: string;
    Email: string;
    Reference_message:string;
    Header_Name:string;
  
}

// Define the schema
const emailTemplatesSchema: Schema<IemailTemplates> =new Schema({
    createdOn: {
      type: Date,
      default: new Date(),
    },
    Title: {
      type: String,
      default:""
    },
    Subtitle: {
      type: String,
      default:""
    },
    SLUG: {
      type: String,
      default:""
    },
    For: {
      type: String,
      default:""
    },
    Template_Name: {
      type: String,
      default:""
    },
    Message: {
      type: String,
      default:""
    },
    Length: {
      type: Number,
      default:0
    },
    Status: {
      type: String,
      default:""
    },
    Template_ID: {
      type: String,
      default:""
    },
    VAR_1: {
      type: String,
      default:""
    },
    VAR_2: {
      type: String,
      default:""
    },
    VAR_3: {
      type: String,
      default:""
    },
    VAR_4: {
      type: String,
      default:""
    },
    Subject: {
      type: String,
      default:""
    },
    Email: {
      type: String,
      default:""
    },
    Reference_message: {
      type: String,
      default:""
    },
    Header_Name:{
      type: String,
      default:""
    }
  });

// Define the model
const Template: Model<IemailTemplates> = mongoose.model<IemailTemplates>("emailTemplate", emailTemplatesSchema);

export default Template;
