import Notification from '../models/Notification.js';

export const createNotification = async (notificationData) => {
  try {
    const notification = new Notification(notificationData);
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const createBulkNotifications = async (notifications) => {
  try {
    const result = await Notification.insertMany(notifications);
    return result;
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId, employeeId) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { 
        _id: notificationId,
        recipient: employeeId,
        isRead: false
      },
      { 
        isRead: true,
        readAt: new Date()
      },
      { new: true }
    );
    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const getUnreadCount = async (employeeId) => {
  try {
    const count = await Notification.countDocuments({
      recipient: employeeId,
      isRead: false
    });
    return count;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};