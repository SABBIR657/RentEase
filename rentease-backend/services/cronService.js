const cron               = require('node-cron');
const InspectionBooking  = require('../models/InspectionBooking');
const sendEmail          = require('../utils/sendEmail');

// Run every hour — check for bookings happening within 24 hours
cron.schedule('0 * * * *', async () => {
  try {
    const now        = new Date();
    const in24Hours  = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const bookings = await InspectionBooking.find({
      status:       'booked',
      reminderSent: false,
      slotDate:     { $gte: now, $lte: in24Hours },
    }).populate('tenantId', 'name email').populate('propertyId', 'title suburb');

    for (const booking of bookings) {
      if (!booking.tenantId?.email) continue;
      await sendEmail({
        to:      booking.tenantId.email,
        subject: `Reminder: Property Inspection Tomorrow`,
        html: `
          <h2>Inspection Reminder</h2>
          <p>Hi ${booking.tenantId.name},</p>
          <p>This is a reminder that you have a property inspection scheduled for tomorrow.</p>
          <p><strong>Property:</strong> ${booking.propertyId?.title || 'N/A'}</p>
          <p><strong>Date:</strong> ${booking.slotDate.toDateString()}</p>
          <p><strong>Time:</strong> ${booking.slotTime}</p>
          <p>Please arrive on time. Good luck!</p>
          <p>— The RentEase Team</p>
        `,
      });
      booking.reminderSent = true;
      await booking.save();
      console.log(`Reminder sent to ${booking.tenantId.email}`);
    }
  } catch (err) {
    console.error('Cron error:', err.message);
  }
});

console.log('Cron jobs started');
