const Review = require('../models/Review');
const Listing = require('../models/Listing');
const Store = require('../models/Store');

// @desc    Create review
// @route   POST /api/reviews
// @access  Private (Buyer)
exports.createReview = async (req, res) => {
  try {
    const { listingId, storeId, rating, title, comment, images } = req.body;

    // Check if listing or store exists
    if (listingId) {
      const listing = await Listing.findById(listingId);
      if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
      req.body.store = listing.store;
    } else if (storeId) {
      const store = await Store.findById(storeId);
      if (!store) return res.status(404).json({ success: false, message: 'Store not found' });
    }

    let mediaUrls = [];
    if (req.files && req.files.length > 0) {
      mediaUrls = req.files.map(file => file.path.replace(/\\/g, '/'));
    }

    const review = await Review.create({
      ...req.body,
      user: req.user.id,
      listing: listingId,
      store: req.body.store || storeId,
      mediaUrls: mediaUrls
    });

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get reviews for a listing or store
// @route   GET /api/reviews
// @access  Public
exports.getReviews = async (req, res) => {
  try {
    const query = { status: 'approved' };
    if (req.query.listing) query.listing = req.query.listing;
    if (req.query.store) query.store = req.query.store;
    if (req.query.status && req.user?.role === 'admin') query.status = req.query.status;

    const reviews = await Review.find(query)
      .populate('user', 'name')
      .populate('listing', 'title')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get my store reviews
// @route   GET /api/reviews/store/my-store
// @access  Private (Seller)
exports.getMyStoreReviews = async (req, res) => {
  try {
    const store = await Store.findOne({ seller: req.user.id });
    if (!store) return res.status(404).json({ success: false, message: 'Store not found' });

    const reviews = await Review.find({ store: store._id })
      .populate('user', 'name')
      .populate('listing', 'title')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Reply to review
// @route   POST /api/reviews/:id/reply
// @access  Private (Seller)
exports.replyToReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate('store');
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    // Verify ownership
    if (review.store.seller.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to reply to this review' });
    }

    review.reply = {
      seller: req.user.id,
      comment: req.body.comment,
      repliedAt: Date.now()
    };

    await review.save();
    res.status(200).json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Moderate review
// @route   PATCH /api/reviews/:id/moderate
// @access  Private (Admin)
exports.moderateReview = async (req, res) => {
  try {
    const { status, note } = req.body;
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    review.status = status;
    review.moderation = {
      admin: req.user.id,
      note,
      moderatedAt: Date.now()
    };

    await review.save();
    res.status(200).json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (User/Admin)
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await review.deleteOne();
    res.status(200).json({ success: true, message: 'Review removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
