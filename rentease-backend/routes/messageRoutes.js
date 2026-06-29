const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { getConversations, getThread, sendMessage, getUnreadCount } = require('../controllers/messageController');

router.use(protect);
router.get('/conversations',          getConversations);
router.get('/unread-count',           getUnreadCount);
router.get('/:propertyId/:userId',    getThread);
router.post('/',                      sendMessage);

module.exports = router;
