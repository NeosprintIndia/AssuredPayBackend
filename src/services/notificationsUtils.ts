
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
  await io.to(userId).emit(`userNotification`, userNotification);
};

export const markNotificationAsRead = async (
  userId: string,
  notificationId: string,
  io: Socket,
): Promise<void> => {
  const userNotification = await UserNotificationModel.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true },
    { new: true }, 
  );
  io.to(userId).emit('userNotification', userNotification);
};

export const postGlobalNotification = async (
  payload: GlobalNotificationPayload,
  io: Socket,
): Promise<void> => {
  const { message } = payload;
  const globalNotification = new GlobalNotificationModel({ message });
  await globalNotification.save();
  io.emit('globalNotification', globalNotification);
};
