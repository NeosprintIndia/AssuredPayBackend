// src/models/userNotificationModel.ts
import { Schema, model, Document } from 'mongoose';

interface UserNotification extends Document {
  userId: string;
  message: string;
  isRead: boolean; // New field to track read status
}

const userNotificationSchema = new Schema<UserNotification>({
  userId: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
});

const UserNotificationModel = model<UserNotification>('UserNotification', userNotificationSchema);

export default UserNotificationModel;
