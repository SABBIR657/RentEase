const Review = require('../models/Review');

exports.createReview = async (req, res) => {
  const { targetId, targetType, rating, comment } = req.body;
  const review = await Review.create({ reviewerId: req.user._id, targetId, targetType, rating, comment });
  res.status(201).json({ success: true, data: review });
};

exports.getPropertyReviews = async (req, res) => {
  const reviews = await Review.find({ targetId: req.params.propertyId, targetType: 'property', isHidden: false })
    .populate('reviewerId', 'name avatar').sort('-createdAt');
  res.json({ success: true, data: reviews });
};

exports.updateReview = async (req, res) => {
  const review = await Review.findOneAndUpdate(
    { _id: req.params.id, reviewerId: req.user._id },
    { rating: req.body.rating, comment: req.body.comment },
    { new: true, runValidators: true }
  );
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
  res.json({ success: true, data: review });
};

exports.deleteReview = async (req, res) => {
  await Review.findOneAndDelete({ _id: req.params.id, reviewerId: req.user._id });
  res.json({ success: true, message: 'Review deleted' });
};

exports.hideReview = async (req, res) => {
  const review = await Review.findByIdAndUpdate(req.params.id, { isHidden: true }, { new: true });
  res.json({ success: true, data: review });
};

exports.unhideReview = async (req, res) => {
  const review = await Review.findByIdAndUpdate(req.params.id, { isHidden: false }, { new: true });
  res.json({ success: true, data: review });
};
