const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { getUsers, getUser, banUser, unbanUser, deleteUser } = require('../controllers/userController');

router.use(protect, authorize('admin'));
router.get('/',           getUsers);
router.get('/:id',        getUser);
router.patch('/:id/ban',  banUser);
router.patch('/:id/unban',unbanUser);
router.delete('/:id',     deleteUser);

module.exports = router;
