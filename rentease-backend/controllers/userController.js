const User = require('../models/User');

exports.getUsers = async (req, res) => {
  const filter = req.query.role ? { role: req.query.role } : {};
  const users  = await User.find(filter).sort('-createdAt');
  res.json({ success: true, data: users });
};

exports.getUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: user });
};

exports.banUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isBanned: true, banReason: req.body.reason }, { new: true });
  res.json({ success: true, data: user });
};

exports.unbanUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isBanned: false, banReason: '' }, { new: true });
  res.json({ success: true, data: user });
};

exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'User deleted' });
};
