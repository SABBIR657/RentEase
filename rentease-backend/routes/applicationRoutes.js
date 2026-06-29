const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { uploadDocuments } = require('../config/cloudinary');
const {
  submitApplication, getMyApplications, getApplication,
  withdrawApplication, getReceivedApplications,
  approveApplication, rejectApplication, getAllApplications
} = require('../controllers/applicationController');

router.post('/',                      protect, authorize('tenant'), uploadDocuments.array('documents', 5), submitApplication);
router.get('/my-applications',        protect, authorize('tenant'), getMyApplications);
router.get('/received',               protect, authorize('owner'),  getReceivedApplications);
router.get('/all',                    protect, authorize('admin'),  getAllApplications);
router.get('/:id',                    protect, getApplication);
router.patch('/:id/withdraw',         protect, authorize('tenant'), withdrawApplication);
router.patch('/:id/approve',          protect, authorize('owner'),  approveApplication);
router.patch('/:id/reject',           protect, authorize('owner'),  rejectApplication);

module.exports = router;
