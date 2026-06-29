const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/analyticsController');

router.use(protect, authorize('admin', 'owner'));
router.get('/avg-rent-by-suburb',      ctrl.avgRentBySuburb);
router.get('/property-type-dist',      ctrl.propertyTypeDistribution);
router.get('/listings-by-city',        ctrl.listingsByCity);
router.get('/rent-range-distribution', ctrl.rentRangeDistribution);
router.get('/bedroom-distribution',    ctrl.bedroomDistribution);
router.get('/rent-trend',              ctrl.rentTrend);
router.get('/price-vs-bedrooms',       ctrl.priceVsBedrooms);
router.get('/vacancy-rate-by-city',    ctrl.vacancyRateByCity);
router.get('/platform-stats',          protect, authorize('admin'), ctrl.platformStats);

module.exports = router;
