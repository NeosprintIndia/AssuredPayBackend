// src/models/globalNotificationModel.ts
import { Schema, model, Document } from 'mongoose';

interface GlobalNotification extends Document {
  message: string;
}

const globalNotificationSchema = new Schema<GlobalNotification>({
  message: { type: String, required: true },
});

const GlobalNotificationModel = model<GlobalNotification>('GlobalNotification', globalNotificationSchema);

export default GlobalNotificationModel;
