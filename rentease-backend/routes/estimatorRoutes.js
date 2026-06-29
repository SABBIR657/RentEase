const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { predict } = require('../controllers/estimatorController');

router.post('/predict', protect, authorize('owner'), predict);

module.exports = router;
