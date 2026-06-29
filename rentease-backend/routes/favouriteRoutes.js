const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { getFavourites, addFavourite, removeFavourite, checkFavourite } = require('../controllers/favouriteController');

router.use(protect);
router.get('/',                          getFavourites);
router.post('/:propertyId',              addFavourite);
router.delete('/:propertyId',            removeFavourite);
router.get('/check/:propertyId',         checkFavourite);

module.exports = router;
