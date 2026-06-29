const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createReview, getPropertyReviews, updateReview,
  deleteReview, hideReview, unhideReview
} = require('../controllers/reviewController');

router.get('/property/:propertyId',        getPropertyReviews);
router.post('/',                           protect, createReview);
router.put('/:id',                         protect, updateReview);
router.delete('/:id',                      protect, deleteReview);
router.patch('/:id/hide',                  protect, authorize('admin'), hideReview);
router.patch('/:id/unhide',                protect, authorize('admin'), unhideReview);

module.exports = router;
