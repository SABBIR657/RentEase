const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetId:   { type: mongoose.Schema.Types.ObjectId, required: true },
  targetType: { type: String, enum: ['property', 'tenant'], required: true },
  rating:     { type: Number, required: true, min: 1, max: 5 },
  comment:    { type: String, required: true, trim: true },
  isHidden:   { type: Boolean, default: false },
}, { timestamps: true });

reviewSchema.index({ targetId: 1, targetType: 1 });
reviewSchema.index({ reviewerId: 1, targetId: 1, targetType: 1 }, { unique: true });

// After save — recalculate property rating
reviewSchema.post('save', async function () {
  if (this.targetType !== 'property') return;
  const Property = mongoose.model('Property');
  const stats = await mongoose.model('Review').aggregate([
    { $match: { targetId: this.targetId, targetType: 'property', isHidden: false } },
    { $group: { _id: '$targetId', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  if (stats.length > 0) {
    await Property.findByIdAndUpdate(this.targetId, {
      averageRating: Math.round(stats[0].avg * 10) / 10,
      totalReviews:  stats[0].count,
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);
