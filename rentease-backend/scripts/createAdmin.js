require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('../models/User');

const createAdmin = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');

  const existing = await User.findOne({ role: 'admin' });
  if (existing) {
    console.log('Admin already exists:', existing.email);
    process.exit(0);
  }

  const admin = await User.create({
    name:       'Admin',
    email:      'admin@rentease.com',
    password:   'admin1122',
    role:       'admin',
    isVerified: true,
  });

  console.log('Admin created successfully!');
  console.log('Email:   ', admin.email);
  console.log('Password: admin123456');
  console.log('Change this password after first login!');
  process.exit(0);
};

createAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});