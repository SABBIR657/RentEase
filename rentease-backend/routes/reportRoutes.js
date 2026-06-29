const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { createReport, getReports, resolveReport, dismissReport } = require('../controllers/reportController');

router.post('/',              protect, createReport);
router.get('/',               protect, authorize('admin'), getReports);
router.patch('/:id/resolve',  protect, authorize('admin'), resolveReport);
router.patch('/:id/dismiss',  protect, authorize('admin'), dismissReport);

module.exports = router;
