const Property    = require('../models/Property');
const APIFeatures = require('../utils/apiFeatures');

// GET /api/v1/properties
exports.getProperties = async (req, res) => {
  const baseQuery = Property.find({ isApproved: true, status: 'available' });
  const features  = new APIFeatures(baseQuery, req.query).search().filter().sort().paginate();
  const total     = await Property.countDocuments({ isApproved: true, status: 'available' });
  const properties = await features.query.populate('ownerId', 'name avatar');
  res.json({ success: true, count: properties.length, total, page: features.page, data: properties });
};

// GET /api/v1/properties/:id
exports.getProperty = async (req, res) => {
  const property = await Property.findById(req.params.id).populate('ownerId', 'name avatar email phone');
  if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
  res.json({ success: true, data: property });
};

// GET /api/v1/properties/featured
exports.getFeatured = async (req, res) => {
  const properties = await Property.find({ isFeatured: true, isApproved: true, status: 'available' }).limit(10);
  res.json({ success: true, data: properties });
};

// GET /api/v1/properties/map
exports.getMapProperties = async (req, res) => {
  const properties = await Property.find({ isApproved: true, status: 'available', 'location.coordinates.0': { $ne: 0 } })
    .select('title suburb rentPrice bedrooms bathrooms type location images averageRating');
  res.json({ success: true, data: properties });
};

// GET /api/v1/properties/nearby?lng=&lat=&radius=10
exports.getNearby = async (req, res) => {
  const { lng, lat, radius = 10 } = req.query;
  if (!lng || !lat) return res.status(400).json({ success: false, message: 'lng and lat are required' });
  const properties = await Property.find({
    location: {
      $nearSphere: {
        $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
        $maxDistance: radius * 1000, // convert km to metres
      },
    },
    isApproved: true,
    status: 'available',
  }).limit(50);
  res.json({ success: true, data: properties });
};

// POST /api/v1/properties
exports.createProperty = async (req, res) => {
  const { latitude, longitude, ...rest } = req.body;
  const property = await Property.create({
    ...rest,
    ownerId: req.user._id,
    source: 'owner',
    location: {
      type: 'Point',
      coordinates: [parseFloat(longitude) || 0, parseFloat(latitude) || 0],
    },
  });
  res.status(201).json({ success: true, data: property });
};

// PUT /api/v1/properties/:id
exports.updateProperty = async (req, res) => {
  let property = await Property.findById(req.params.id);
  if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
  if (property.ownerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorised' });
  }
  property = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json({ success: true, data: property });
};

// PATCH /api/v1/properties/:id/status
exports.updateStatus = async (req, res) => {
  const property = await Property.findOneAndUpdate(
    { _id: req.params.id, ownerId: req.user._id },
    { status: req.body.status },
    { new: true }
  );
  if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
  res.json({ success: true, data: property });
};

// PATCH /api/v1/properties/:id/images
exports.uploadImages = async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
  if (property.ownerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorised' });
  }
  const urls = req.files.map(f => f.path);
  property.images.push(...urls);
  await property.save();
  res.json({ success: true, data: property });
};

// DELETE /api/v1/properties/:id
exports.deleteProperty = async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
  if (property.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorised' });
  }
  await property.deleteOne();
  res.json({ success: true, message: 'Property deleted' });
};

// GET /api/v1/properties/my-listings
exports.getMyListings = async (req, res) => {
  const properties = await Property.find({ ownerId: req.user._id }).sort('-createdAt');
  res.json({ success: true, data: properties });
};

// PATCH /api/v1/properties/:id/approve  [admin]
exports.approveProperty = async (req, res) => {
  const property = await Property.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
  if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
  res.json({ success: true, data: property });
};

// PATCH /api/v1/properties/:id/reject  [admin]
exports.rejectProperty = async (req, res) => {
  const property = await Property.findByIdAndUpdate(req.params.id, { isApproved: false }, { new: true });
  if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
  res.json({ success: true, data: property });
};

// PATCH /api/v1/properties/:id/feature  [admin]
exports.toggleFeature = async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
  property.isFeatured = !property.isFeatured;
  await property.save();
  res.json({ success: true, data: property });
};

// GET /api/v1/properties/pending-approval  [admin]
exports.getPendingApproval = async (req, res) => {
  const properties = await Property.find({ isApproved: false }).populate('ownerId', 'name email').sort('-createdAt');
  res.json({ success: true, data: properties });
};
