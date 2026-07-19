require('dotenv').config();
const mongoose = require('mongoose');

const OWNER_EMAIL = 'testowner3@gmail.com'; // ← change this

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;

  // Find the owner user
  const owner = await db.collection('users').findOne({ email: OWNER_EMAIL });
  if (!owner) {
    console.log('Owner not found. Register as owner first.');
    process.exit(1);
  }

  // Assign this owner to all Kaggle properties
  const result = await db.collection('properties').updateMany(
    { source: 'kaggle', ownerId: { $exists: false } },
    { $set: { ownerId: owner._id } }
  );

  console.log(`Assigned owner to ${result.modifiedCount} Kaggle properties`);
  console.log(`Owner: ${owner.name} (${owner.email})`);
  process.exit(0);
});