import mongoose, { Schema, Document, Types } from "mongoose";

interface ILog extends Document {
  timestamp: Number;
  vendorRequestBody: object;
  vendorResponseBody: object;
  user: Types.ObjectId | ILog;
}

const logSchema: Schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "RegisterUser",
  },
  timestamp: {
    type: Number,
    default: Date.now,
  },

  vendorRequestBody: { type: Object, deafult: "" },
  vendorResponseBody: { type: Object, deafult: "" },
});

const Log = mongoose.model<ILog>("Log", logSchema);

export default Log;
