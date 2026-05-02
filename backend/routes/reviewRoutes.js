const express = require('express');
const {
  getReviews,
  createReview,
  getMyStoreReviews,
  replyToReview,
  moderateReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect, authorize, sellerOnly, buyerOnly } = require('../middleware/auth');
const { upload } = require('../middleware/upload'); // Supports multi-media for reviews

const router = express.Router();

router.route('/')
  .get(getReviews)
  .post(protect, buyerOnly, upload.array('images', 5), createReview);

router.get('/store/my-store', protect, sellerOnly, getMyStoreReviews);

router.post('/:id/reply', protect, sellerOnly, replyToReview);

router.patch('/:id/moderate', protect, authorize('admin'), moderateReview);

router.delete('/:id', protect, deleteReview);

module.exports = router;
