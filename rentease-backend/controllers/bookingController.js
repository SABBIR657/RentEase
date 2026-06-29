const InspectionBooking = require('../models/InspectionBooking');
const Notification      = require('../models/Notification');
const sendEmail         = require('../utils/sendEmail');
const { sendNotification } = require('../services/socketService');

const notify = async (userId, type, title, body, link = '') => {
  const n = await Notification.create({ userId, type, title, body, link });
  sendNotification(userId, n);
};

// POST /api/v1/bookings/slots
exports.createSlots = async (req, res) => {
  const { propertyId, slots } = req.body; // slots: [{ slotDate, slotTime }]
  const created = await InspectionBooking.insertMany(
    slots.map(s => ({ propertyId, ownerId: req.user._id, slotDate: s.slotDate, slotTime: s.slotTime }))
  );
  res.status(201).json({ success: true, data: created });
};

// GET /api/v1/bookings/slots/:propertyId
exports.getOpenSlots = async (req, res) => {
  const slots = await InspectionBooking.find({ propertyId: req.params.propertyId, status: 'open' }).sort('slotDate slotTime');
  res.json({ success: true, data: slots });
};

// POST /api/v1/bookings/:slotId/book
exports.bookSlot = async (req, res) => {
  const slot = await InspectionBooking.findOne({ _id: req.params.slotId, status: 'open' })
    .populate('ownerId', 'name email').populate('propertyId', 'title suburb');
  if (!slot) return res.status(422).json({ success: false, message: 'Slot not available' });
  slot.tenantId = req.user._id;
  slot.status   = 'booked';
  await slot.save();

  await notify(slot.ownerId._id, 'booking', 'New Inspection Booking',
    `${req.user.name} booked an inspection for ${slot.propertyId?.title}`, '/dashboard/bookings');

  await sendEmail({
    to: req.user.email,
    subject: 'Inspection Booking Confirmed',
    html: `<h2>Booking Confirmed!</h2>
           <p>Your inspection for <strong>${slot.propertyId?.title}</strong> is confirmed.</p>
           <p><strong>Date:</strong> ${new Date(slot.slotDate).toDateString()} at ${slot.slotTime}</p>`,
  }).catch(() => {});

  res.json({ success: true, data: slot });
};

// PATCH /api/v1/bookings/:id/cancel
exports.cancelBooking = async (req, res) => {
  const booking = await InspectionBooking.findById(req.params.id);
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
  const isTenant = booking.tenantId?.toString() === req.user._id.toString();
  const isOwner  = booking.ownerId.toString()   === req.user._id.toString();
  if (!isTenant && !isOwner) return res.status(403).json({ success: false, message: 'Not authorised' });
  booking.status      = 'cancelled';
  booking.cancelledBy = isTenant ? 'tenant' : 'owner';
  booking.cancelReason = req.body.reason || '';
  await booking.save();
  res.json({ success: true, data: booking });
};

// GET /api/v1/bookings/my-bookings
exports.getMyBookings = async (req, res) => {
  const bookings = await InspectionBooking.find({ tenantId: req.user._id })
    .populate('propertyId', 'title suburb images').sort('-slotDate');
  res.json({ success: true, data: bookings });
};

// GET /api/v1/bookings/my-slots
exports.getMySlots = async (req, res) => {
  const slots = await InspectionBooking.find({ ownerId: req.user._id })
    .populate('tenantId', 'name email phone').populate('propertyId', 'title').sort('slotDate');
  res.json({ success: true, data: slots });
};

// DELETE /api/v1/bookings/slots/:id
exports.deleteSlot = async (req, res) => {
  const slot = await InspectionBooking.findOne({ _id: req.params.id, ownerId: req.user._id, status: 'open' });
  if (!slot) return res.status(404).json({ success: false, message: 'Open slot not found' });
  await slot.deleteOne();
  res.json({ success: true, message: 'Slot deleted' });
};
