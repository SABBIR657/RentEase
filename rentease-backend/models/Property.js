const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  ownerId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:         { type: String, required: true, trim: true },
  description:   { type: String, default: '' },
  type:          { type: String, enum: ['house', 'apartment', 'unit', 'townhouse', 'studio', 'other'], required: true },
  suburb:        { type: String, required: true, trim: true },
  locality:      { type: String, default: '' },
  state:         { type: String, default: '' },
  postcode:      { type: String, default: '' },
  street_address:{ type: String, default: '' },
  location: {
    type:        { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
  },
  rentPrice:     { type: Number, required: true, min: 0 },
  bedrooms:      { type: Number, default: 0, min: 0 },
  bathrooms:     { type: Number, default: 0, min: 0 },
  parking:       { type: Number, default: 0, min: 0 },
  amenities:     [{ type: String }],
  images:        [{ type: String }],
  status:        { type: String, enum: ['available', 'rented', 'pending'], default: 'available' },
  isFeatured:    { type: Boolean, default: false },
  isApproved:    { type: Boolean, default: false },
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews:  { type: Number, default: 0 },
  source:        { type: String, enum: ['kaggle', 'owner'], default: 'owner' },
}, { timestamps: true });

propertySchema.index({ location: '2dsphere' });
propertySchema.index({ suburb: 1, locality: 1 });
propertySchema.index({ rentPrice: 1 });
propertySchema.index({ bedrooms: 1, bathrooms: 1 });
propertySchema.index({ status: 1, isApproved: 1 });
propertySchema.index({ ownerId: 1 });
propertySchema.index({ title: 'text', description: 'text', suburb: 'text' });

module.exports = mongoose.model('Property', propertySchema);
