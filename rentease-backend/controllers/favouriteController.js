const Favourite = require('../models/Favourite');

exports.getFavourites = async (req, res) => {
  const favs = await Favourite.find({ userId: req.user._id }).populate('propertyId').sort('-createdAt');
  res.json({ success: true, data: favs });
};

exports.addFavourite = async (req, res) => {
  const fav = await Favourite.create({ userId: req.user._id, propertyId: req.params.propertyId });
  res.status(201).json({ success: true, data: fav });
};

exports.removeFavourite = async (req, res) => {
  await Favourite.findOneAndDelete({ userId: req.user._id, propertyId: req.params.propertyId });
  res.json({ success: true, message: 'Removed from favourites' });
};

exports.checkFavourite = async (req, res) => {
  const fav = await Favourite.findOne({ userId: req.user._id, propertyId: req.params.propertyId });
  res.json({ success: true, data: { isFavourited: !!fav } });
};
