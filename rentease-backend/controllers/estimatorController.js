// Simple in-JS rent estimator based on Kaggle data averages.
// In Week 10, replace this with a Python FastAPI ML microservice call.

exports.predict = async (req, res) => {
  const { suburb, type, bedrooms, bathrooms, parking } = req.body;
  const Property = require('../models/Property');

  // Find similar properties and average their rent
  const similar = await Property.find({
    suburb: new RegExp(suburb, 'i'),
    type,
    bedrooms: Number(bedrooms),
    isApproved: true,
  }).select('rentPrice').limit(50).lean();

  if (similar.length === 0) {
    // Fallback — use type-based average
    const fallback = await Property.find({ type, isApproved: true }).select('rentPrice').limit(100).lean();
    const avg = fallback.reduce((s, p) => s + p.rentPrice, 0) / (fallback.length || 1);
    return res.json({ success: true, data: {
      predictedRent: Math.round(avg),
      currency: 'AUD', period: 'weekly',
      confidence: 'low', range: { min: Math.round(avg * 0.85), max: Math.round(avg * 1.15) },
      note: 'Based on property type average — not enough suburb data',
    }});
  }

  const avg = similar.reduce((s, p) => s + p.rentPrice, 0) / similar.length;
  const adjustedAvg = avg + (Number(bathrooms) - 1) * 20 + (Number(parking) > 0 ? 30 : 0);

  res.json({ success: true, data: {
    predictedRent: Math.round(adjustedAvg),
    currency: 'AUD', period: 'weekly',
    confidence: similar.length > 10 ? 'high' : 'medium',
    range: { min: Math.round(adjustedAvg * 0.9), max: Math.round(adjustedAvg * 1.1) },
    basedOn: similar.length,
  }});
};
