const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  propertyId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  ownerId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tenantId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  slotDate:     { type: Date, required: true },
  slotTime:     { type: String, required: true },
  status:       { type: String, enum: ['open', 'booked', 'cancelled'], default: 'open' },
  reminderSent: { type: Boolean, default: false },
  cancelledBy:  { type: String, enum: ['tenant', 'owner', null], default: null },
  cancelReason: { type: String, default: '' },
}, { timestamps: true });

bookingSchema.index({ propertyId: 1, slotDate: 1, slotTime: 1 }, { unique: true });
bookingSchema.index({ tenantId: 1 });
bookingSchema.index({ ownerId: 1 });
bookingSchema.index({ reminderSent: 1, slotDate: 1 });

module.exports = mongoose.model('InspectionBooking', bookingSchema);
