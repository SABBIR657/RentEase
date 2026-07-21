const { Server } = require('socket.io');
const jwt        = require('jsonwebtoken');
const User       = require('../models/User');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true },
  });

  // Auth middleware for Socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication error'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user    = await User.findById(decoded.id).select('name role');
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.user.name}`);

    // Join personal notification room
    socket.join(`user_${socket.user._id.toString()}`);

    // Join property conversation room
    socket.on('join_room', ({ propertyId, otherUserId }) => {
      const ids   = [socket.user._id.toString(), otherUserId].sort();
      const room  = `property_${propertyId}_${ids[0]}_${ids[1]}`;
      socket.join(room);
    });

    // Send message
  socket.on('send_message', ({ propertyId, otherUserId, content, _id, senderId, createdAt }) => {
  const ids  = [socket.user._id.toString(), otherUserId].sort()
  const room = `property_${propertyId}_${ids[0]}_${ids[1]}`

  // Broadcast to everyone in room INCLUDING sender
  // But frontend filters by senderId to avoid duplicates
  io.to(room).emit('receive_message', {
    _id,
    senderId,
    content,
    createdAt,
    propertyId,
  })
})

// socket.on(
//   'send_message',
//   ({
//     propertyId,
//     otherUserId,
//     receiverId,
//     content,
//     _id,
//     senderId,
//     createdAt,
//   }) => {
//     const ids = [
//       socket.user._id.toString(),
//       otherUserId.toString(),
//     ].sort();

//     const room =
//       `property_${propertyId}_${ids[0]}_${ids[1]}`;

//     console.log("📤 Broadcasting message:", {
//       room,
//       propertyId,
//       senderId,
//       receiverId,
//       content,
//     });

//     io.to(room).emit(
//       'receive_message',
//       {
//         _id,
//         senderId,
//         receiverId,
//         content,
//         createdAt,
//         propertyId,
//       }
//     );
//   }
// );

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.user.name}`);
    });
  });

  return io;
};

// Send notification to a specific user
const sendNotification = (userId, notification) => {
  if (io) io.to(`user_${userId}`).emit('new_notification', notification);
};

module.exports = { initSocket, sendNotification };
