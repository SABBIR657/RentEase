const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  const page  = Number(req.query.page)  || 1;
  const limit = Number(req.query.limit) || 20;
  const notifications = await Notification.find({ userId: req.user._id })
    .sort('-createdAt').skip((page - 1) * limit).limit(limit);
  res.json({ success: true, data: notifications });
};

exports.getUnreadCount = async (req, res) => {
  const count = await Notification.countDocuments({ userId: req.user._id, isRead: false });
  res.json({ success: true, data: { count } });
};

exports.markAsRead = async (req, res) => {
  await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { isRead: true });
  res.json({ success: true, message: 'Marked as read' });
};

exports.markAllRead = async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
  res.json({ success: true, message: 'All marked as read' });
};

exports.deleteNotification = async (req, res) => {
  await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  res.json({ success: true, message: 'Notification deleted' });
};
