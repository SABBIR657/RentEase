const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { uploadImages } = require('../config/cloudinary');
const {
  getProperties, getProperty, getFeatured, getMapProperties,
  getNearby, createProperty, updateProperty, updateStatus,
  uploadImages: uploadImagesCtrl, deleteProperty, getMyListings,
  approveProperty, rejectProperty, toggleFeature, getPendingApproval
} = require('../controllers/propertyController');

// Public
router.get('/',                   getProperties);
router.get('/featured',           getFeatured);
router.get('/map',                getMapProperties);
router.get('/nearby',             getNearby);
router.get('/:id',                getProperty);

// Owner
router.post('/',                  protect, authorize('owner'), createProperty);
router.put('/:id',                protect, authorize('owner'), updateProperty);
router.patch('/:id/status',       protect, authorize('owner'), updateStatus);
router.patch('/:id/images',       protect, authorize('owner'), uploadImages.array('images', 10), uploadImagesCtrl);
router.delete('/:id',             protect, authorize('owner', 'admin'), deleteProperty);
router.get('/owner/my-listings',  protect, authorize('owner'), getMyListings);

// Admin
router.patch('/:id/approve',          protect, authorize('admin'), approveProperty);
router.patch('/:id/reject',           protect, authorize('admin'), rejectProperty);
router.patch('/:id/feature',          protect, authorize('admin'), toggleFeature);
router.get('/admin/pending-approval', protect, authorize('admin'), getPendingApproval);

module.exports = router;
