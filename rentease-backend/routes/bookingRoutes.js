const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createSlots, getOpenSlots, bookSlot, cancelBooking,
  getMyBookings, getMySlots, deleteSlot
} = require('../controllers/bookingController');

router.post('/slots',            protect, authorize('owner'),  createSlots);
router.get('/slots/:propertyId',                               getOpenSlots);
router.post('/:slotId/book',     protect, authorize('tenant'), bookSlot);
router.patch('/:id/cancel',      protect,                      cancelBooking);
router.get('/my-bookings',       protect, authorize('tenant'), getMyBookings);
router.get('/my-slots',          protect, authorize('owner'),  getMySlots);
router.delete('/slots/:id',      protect, authorize('owner'),  deleteSlot);

module.exports = router;
