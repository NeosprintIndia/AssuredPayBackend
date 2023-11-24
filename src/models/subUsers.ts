import mongoose, { Document, Schema, Model, Types } from "mongoose";

// Define the interface for the document
interface ISubUser extends Document {
  userId: Types.ObjectId | IUser;
  belongsTo: Types.ObjectId | IUser;
  updated_at: Date;

}
// Define the reference interface for the user field
interface IUser extends Document {
  _id: Types.ObjectId;
}
// Define the schema
const SubUserSchema: Schema<ISubUser> = new Schema({
    belongsTo: {
        type: Schema.Types.ObjectId,
        ref: "RegisterUser",
      },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'RegisterUser' },
      updated_at: { type: Date, default: Date.now },
});
// Define the model
const Subuser: Model<ISubUser> = mongoose.model<ISubUser>(
  "Subuser",
  SubUserSchema
);

export default Subuser;
