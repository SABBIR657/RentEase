const Report = require('../models/Report');

exports.createReport = async (req, res) => {
  const report = await Report.create({ ...req.body, reportedBy: req.user._id });
  res.status(201).json({ success: true, data: report });
};

exports.getReports = async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  const reports = await Report.find(filter).populate('reportedBy', 'name email').populate('propertyId', 'title').sort('-createdAt');
  res.json({ success: true, data: reports });
};

exports.resolveReport = async (req, res) => {
  const report = await Report.findByIdAndUpdate(req.params.id, { status: 'resolved', resolvedBy: req.user._id, resolution: req.body.resolution }, { new: true });
  res.json({ success: true, data: report });
};

exports.dismissReport = async (req, res) => {
  const report = await Report.findByIdAndUpdate(req.params.id, { status: 'dismissed', resolvedBy: req.user._id }, { new: true });
  res.json({ success: true, data: report });
};
