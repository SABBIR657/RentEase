const crypto       = require('crypto');
const User         = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail    = require('../utils/sendEmail');

// POST /api/v1/auth/register
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email and password are required' });
  }
  const allowedRoles = ['tenant', 'owner'];
  const userRole = allowedRoles.includes(role) ? role : 'tenant';

  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ success: false, message: 'Email already registered' });

  const verifyToken = crypto.randomBytes(32).toString('hex');
  // const user = await User.create({ name, email, password, role: userRole, verifyToken });
  const user = await User.create({ name, email, password, role: userRole, isVerified: true });

  // Send verification email
  // const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`;
  // await sendEmail({
  //   to: email,
  //   subject: 'Verify your RentEase account',
  //   html: `<h2>Welcome to RentEase!</h2><p>Click below to verify your email:</p>
  //          <a href="${verifyUrl}" style="background:#1B5E9B;color:#fff;padding:10px 20px;border-radius:5px;text-decoration:none;">Verify Email</a>`,
  // }).catch(() => {}); // don't fail if email fails in dev

  const token = generateToken(user._id);
  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: { token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } },
  });
};

// POST /api/v1/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
  if (user.isBanned) {
    return res.status(403).json({ success: false, message: `Account banned: ${user.banReason}` });
  }
  const token = generateToken(user._id);
  res.json({
    success: true,
    data: { token, user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, isVerified: user.isVerified } },
  });
};

// GET /api/v1/auth/verify-email/:token
exports.verifyEmail = async (req, res) => {
  const user = await User.findOne({ verifyToken: req.params.token });
  if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired verification link' });
  user.isVerified  = true;
  user.verifyToken = undefined;
  await user.save();
  res.json({ success: true, message: 'Email verified successfully' });
};

// POST /api/v1/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(404).json({ success: false, message: 'No account with that email' });
  const token  = crypto.randomBytes(32).toString('hex');
  user.resetToken       = token;
  user.resetTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save();
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
  await sendEmail({
    to: user.email,
    subject: 'RentEase Password Reset',
    html: `<p>Click to reset your password (valid 1 hour):</p>
           <a href="${resetUrl}">Reset Password</a>`,
  });
  res.json({ success: true, message: 'Password reset email sent' });
};

// POST /api/v1/auth/reset-password/:token
exports.resetPassword = async (req, res) => {
  const user = await User.findOne({ resetToken: req.params.token, resetTokenExpiry: { $gt: Date.now() } });
  if (!user) return res.status(400).json({ success: false, message: 'Token invalid or expired' });
  user.password         = req.body.password;
  user.resetToken       = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();
  res.json({ success: true, message: 'Password reset successful' });
};

// GET /api/v1/auth/me
exports.getMe = async (req, res) => {
  res.json({ success: true, data: req.user });
};

// PUT /api/v1/auth/me
exports.updateMe = async (req, res) => {
  const { name, phone, address } = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, { name, phone, address }, { new: true, runValidators: true });
  res.json({ success: true, data: user });
};

// PATCH /api/v1/auth/me/password
exports.changePassword = async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(req.body.currentPassword))) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }
  user.password = req.body.newPassword;
  await user.save();
  res.json({ success: true, message: 'Password changed successfully' });
};
