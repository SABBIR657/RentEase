const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  tenantId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  propertyId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  ownerId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status:       { type: String, enum: ['pending', 'approved', 'rejected', 'withdrawn'], default: 'pending' },
  message:      { type: String, default: '' },
  documents:    [{ label: { type: String }, url: { type: String } }],
  rejectReason: { type: String, default: '' },
  leaseUrl:     { type: String, default: '' },
}, { timestamps: true });

applicationSchema.index({ tenantId: 1 });
applicationSchema.index({ propertyId: 1 });
applicationSchema.index({ ownerId: 1 });
applicationSchema.index({ tenantId: 1, propertyId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
