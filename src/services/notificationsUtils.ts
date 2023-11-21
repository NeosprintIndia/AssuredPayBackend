
import UserNotificationModel from '../models/pushnotifications';
import GlobalNotificationModel from '../models/globalnotifications';
import { Socket } from 'socket.io';
interface UserNotificationPayload {
  userId: string;
  message: string;
}
interface GlobalNotificationPayload {
  message: string;
}
export const postUserNotification = async (
  payload: UserNotificationPayload,
  io: Socket,
): Promise<void> => {
  const { userId, message } = payload;
  const userNotification = new UserNotificationModel({ userId, message });
  await userNotification.save();

  // Emit user-specific notification to the corresponding client
  await io.to(userId).emit(`userNotification`, userNotification);
  // await io.to(userId).emit(`userNotification_${userId}`, userNotification);
};

export const markNotificationAsRead = async (
  userId: string,
  notificationId: string,
  io: Socket,
): Promise<void> => {
  // Find the user notification by ID
  const userNotification = await UserNotificationModel.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true },
    { new: true }, // Return the modified document
  );

  // Emit the updated user notification to the corresponding client
  io.to(userId).emit('userNotification', userNotification);
};

export const postGlobalNotification = async (
  payload: GlobalNotificationPayload,
  io: Socket,
): Promise<void> => {
  const { message } = payload;
  const globalNotification = new GlobalNotificationModel({ message });
  await globalNotification.save();

  // Emit global notification to all connected clients
  io.emit('globalNotification', globalNotification);
};
