require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const total = await mongoose.connection.db
    .collection('properties').countDocuments();

  const withCoords = await mongoose.connection.db
    .collection('properties').countDocuments({
      'location.coordinates.0': { $ne: 0 }
    });

  console.log('Total properties:    ', total);
  console.log('With coordinates:    ', withCoords);
  console.log('Without coordinates: ', total - withCoords);
  process.exit(0);
}).catch(err => {
  console.log('Error:', err.message);
  process.exit(1);
});