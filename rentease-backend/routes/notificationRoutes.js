const router = require('express').Router();
const { protect } = require('../middleware/auth');
const {
  getNotifications, getUnreadCount, markAsRead, markAllRead, deleteNotification
} = require('../controllers/notificationController');

router.use(protect);
router.get('/',              getNotifications);
router.get('/unread-count',  getUnreadCount);
router.patch('/read-all',    markAllRead);
router.patch('/:id/read',    markAsRead);
router.delete('/:id',        deleteNotification);

module.exports = router;
