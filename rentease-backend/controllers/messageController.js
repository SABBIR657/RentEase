const Message = require('../models/Message');

const getRoomId = (uid1, uid2, propertyId) => {
  const ids = [uid1.toString(), uid2.toString()].sort();
  return `${propertyId}_${ids[0]}_${ids[1]}`;
};

// GET /api/v1/messages/conversations
exports.getConversations = async (req, res) => {
  const messages = await Message.aggregate([
    { $match: { $or: [{ senderId: req.user._id }, { receiverId: req.user._id }] } },
    { $sort: { createdAt: -1 } },
    { $group: { _id: { propertyId: '$propertyId', room: { $cond: [{ $lt: ['$senderId', '$receiverId'] }, { $concat: [{ $toString: '$senderId' }, '_', { $toString: '$receiverId' }] }, { $concat: [{ $toString: '$receiverId' }, '_', { $toString: '$senderId' }] }] } }, lastMessage: { $first: '$$ROOT' }, unread: { $sum: { $cond: [{ $and: [{ $eq: ['$receiverId', req.user._id] }, { $eq: ['$isRead', false] }] }, 1, 0] } } } },
    { $sort: { 'lastMessage.createdAt': -1 } },
  ]);
  res.json({ success: true, data: messages });
};

// GET /api/v1/messages/:propertyId/:userId
exports.getThread = async (req, res) => {
  const { propertyId, userId } = req.params;
  const messages = await Message.find({
    propertyId,
    $or: [
      { senderId: req.user._id, receiverId: userId },
      { senderId: userId, receiverId: req.user._id },
    ],
  }).sort('createdAt');
  // Mark received messages as read
  await Message.updateMany({ propertyId, receiverId: req.user._id, senderId: userId, isRead: false }, { isRead: true });
  res.json({ success: true, data: messages });
};

// POST /api/v1/messages
exports.sendMessage = async (req, res) => {
  const { receiverId, propertyId, content } = req.body;
  const message = await Message.create({ senderId: req.user._id, receiverId, propertyId, content });
  res.status(201).json({ success: true, data: message });
};

// GET /api/v1/messages/unread-count
exports.getUnreadCount = async (req, res) => {
  const count = await Message.countDocuments({ receiverId: req.user._id, isRead: false });
  res.json({ success: true, data: { count } });
};
