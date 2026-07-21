const Message = require('../models/Message');

const getRoomId = (uid1, uid2, propertyId) => {
  const ids = [uid1.toString(), uid2.toString()].sort();
  return `${propertyId}_${ids[0]}_${ids[1]}`;
};

// GET /api/v1/messages/conversations
exports.getConversations = async (req, res) => {
  const userId = req.user._id

  // Get all messages involving this user
  const messages = await Message.find({
    $or: [{ senderId: userId }, { receiverId: userId }]
  })
  .populate('senderId',   'name avatar')
  .populate('receiverId', 'name avatar')
  .populate('propertyId', 'title')
  .sort('-createdAt')

  // Group by conversation (propertyId + other user)
  const convoMap = new Map()

  messages.forEach(msg => {
    const otherId = msg.senderId._id.toString() === userId.toString()
      ? msg.receiverId._id.toString()
      : msg.senderId._id.toString()

    const key = `${msg.propertyId?._id}_${otherId}`

    if (!convoMap.has(key)) {
      convoMap.set(key, {
        lastMessage: msg,
        unread: (!msg.isRead && msg.receiverId._id.toString() === userId.toString()) ? 1 : 0
      })
    } else {
      const existing = convoMap.get(key)
      if (!msg.isRead && msg.receiverId._id.toString() === userId.toString()) {
        existing.unread += 1
      }
    }
  })

  const conversations = Array.from(convoMap.values())

  res.json({ success: true, data: conversations })
}

// GET /api/v1/messages/:propertyId/:userId
exports.getThread = async (req, res) => {
  const { propertyId, userId } = req.params

  const messages = await Message.find({
    propertyId,
    $or: [
      { senderId: req.user._id, receiverId: userId },
      { senderId: userId, receiverId: req.user._id },
    ],
  })
  .populate('senderId',   'name avatar')
  .populate('receiverId', 'name avatar')
  .sort('createdAt')

  // Mark received messages as read
  await Message.updateMany(
    { propertyId, receiverId: req.user._id, senderId: userId, isRead: false },
    { isRead: true }
  )

  res.json({ success: true, data: messages })
}

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
