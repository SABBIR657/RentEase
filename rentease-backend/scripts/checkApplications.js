require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;

  const applications = await db.collection('applications').find({}).toArray();
  console.log('Total applications:', applications.length);
  
  applications.forEach(app => {
    console.log('---');
    console.log('Application ID:', app._id);
    console.log('Tenant ID:    ', app.tenantId);
    console.log('Property ID:  ', app.propertyId);
    console.log('Owner ID:     ', app.ownerId);
    console.log('Status:       ', app.status);
  });

  const users = await db.collection('users').find({}, { 
    projection: { email: 1, role: 1, name: 1, _id: 1 } 
  }).toArray();
  
  console.log('\nAll users:');
  users.forEach(u => console.log(`  ${u._id} | ${u.email} | ${u.role}`));

  process.exit(0);
});