const Property = require('../models/Property');

const dateFilter = (req) => {
  const filter = { isApproved: true };
  if (req.query.startDate || req.query.endDate) {
    filter.createdAt = {};
    if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate);
    if (req.query.endDate)   filter.createdAt.$lte = new Date(req.query.endDate);
  }
  return filter;
};

exports.avgRentBySuburb = async (req, res) => {
  const data = await Property.aggregate([
    { $match: dateFilter(req) },
    { $group: { _id: '$suburb', avgRent: { $avg: '$rentPrice' }, count: { $sum: 1 } } },
    { $sort: { avgRent: -1 } }, { $limit: 20 }
  ]);
  res.json({ success: true, data });
};

exports.propertyTypeDistribution = async (req, res) => {
  const data = await Property.aggregate([
    { $match: dateFilter(req) },
    { $group: { _id: '$type', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  res.json({ success: true, data });
};

exports.listingsByCity = async (req, res) => {
  const data = await Property.aggregate([
    { $match: dateFilter(req) },
    { $group: { _id: '$locality', count: { $sum: 1 } } },
    { $sort: { count: -1 } }, { $limit: 15 }
  ]);
  res.json({ success: true, data });
};

exports.rentRangeDistribution = async (req, res) => {
  const data = await Property.aggregate([
    { $match: dateFilter(req) },
    { $bucket: { groupBy: '$rentPrice', boundaries: [0,200,400,600,800,1000,1500,2000,99999], default: '2000+',
      output: { count: { $sum: 1 }, avgRent: { $avg: '$rentPrice' } } } }
  ]);
  res.json({ success: true, data });
};

exports.bedroomDistribution = async (req, res) => {
  const data = await Property.aggregate([
    { $match: dateFilter(req) },
    { $group: { _id: '$bedrooms', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
  res.json({ success: true, data });
};

exports.rentTrend = async (req, res) => {
  const data = await Property.aggregate([
    { $match: dateFilter(req) },
    { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, avgRent: { $avg: '$rentPrice' } } },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);
  res.json({ success: true, data });
};

exports.priceVsBedrooms = async (req, res) => {
  const data = await Property.find(dateFilter(req)).select('rentPrice bedrooms suburb type').limit(500).lean();
  res.json({ success: true, data });
};

exports.vacancyRateByCity = async (req, res) => {
  const data = await Property.aggregate([
    { $match: { isApproved: true } },
    { $group: { _id: { city: '$locality', status: '$status' }, count: { $sum: 1 } } },
    { $group: { _id: '$_id.city', statuses: { $push: { status: '$_id.status', count: '$count' } }, total: { $sum: '$count' } } },
    { $sort: { total: -1 } }, { $limit: 15 }
  ]);
  res.json({ success: true, data });
};

exports.platformStats = async (req, res) => {
  const User        = require('../models/User');
  const Application = require('../models/Application');
  const Booking     = require('../models/InspectionBooking');
  const [users, properties, applications, bookings] = await Promise.all([
    User.countDocuments(),
    Property.countDocuments({ isApproved: true }),
    Application.countDocuments(),
    Booking.countDocuments(),
  ]);
  res.json({ success: true, data: { users, properties, applications, bookings } });
};
