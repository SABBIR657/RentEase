const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reportedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  propertyId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  reason:      { type: String, enum: ['fraud', 'inaccurate', 'inappropriate', 'spam', 'other'], required: true },
  description: { type: String, default: '' },
  status:      { type: String, enum: ['open', 'reviewed', 'resolved', 'dismissed'], default: 'open' },
  resolvedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  resolution:  { type: String, default: '' },
}, { timestamps: true });

reportSchema.index({ status: 1 });
reportSchema.index({ propertyId: 1 });

module.exports = mongoose.model('Report', reportSchema);
