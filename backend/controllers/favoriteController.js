const Favorite = require('../models/Favorite');
const Listing = require('../models/Listing');

// @desc    Get my favorites
// @route   GET /api/favorites
// @access  Private
exports.getMyFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id }).populate('listing');
    res.json({ success: true, count: favorites.length, data: favorites });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add favorite
// @route   POST /api/favorites
// @access  Private
exports.addFavorite = async (req, res) => {
  try {
    const { listingId } = req.body;

    // Check if listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    // Check if already favorited
    const alreadyFavorited = await Favorite.findOne({
      user: req.user._id,
      listing: listingId,
    });

    if (alreadyFavorited) {
      return res.status(400).json({ success: false, message: 'Already in favorites' });
    }

    const favorite = await Favorite.create({
      user: req.user._id,
      listing: listingId,
    });

    res.status(201).json({ success: true, data: favorite });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove favorite
// @route   DELETE /api/favorites/:id
// @access  Private
exports.removeFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findById(req.params.id);

    if (!favorite) {
      return res.status(404).json({ success: false, message: 'Favorite not found' });
    }

    // Check owner
    if (favorite.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    await favorite.deleteOne();

    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
