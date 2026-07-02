const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:             { type: String, required: true, trim: true },
  email:            { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:         { type: String, required: true, minlength: 6, select: false },
  role:             { type: String, enum: ['tenant', 'owner', 'admin'], default: 'tenant' },
  avatar:           { type: String, default: '' },
  phone:            { type: String, default: '' },
  address:          { type: String, default: '' },
  // isVerified:       { type: Boolean, default: false },
  isVerified: { type: Boolean, default: true },
  isBanned:         { type: Boolean, default: false },
  banReason:        { type: String, default: '' },
  resetToken:       { type: String },
  resetTokenExpiry: { type: Date },
  verifyToken:      { type: String },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);
