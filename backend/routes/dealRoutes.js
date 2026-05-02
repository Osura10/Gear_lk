const express = require('express');
const {
  getDeals,
  createDeal,
  updateDeal,
  deleteDeal,
  createPriceDrop,
  getPriceHistory
} = require('../controllers/dealController');
const { protect, sellerOnly } = require('../middleware/auth');
const { storeUpload } = require('../middleware/upload'); // Image-only for banners

const router = express.Router();

router.route('/')
  .get(getDeals)
  .post(protect, sellerOnly, storeUpload.single('promoBanner'), createDeal);

router.route('/:id')
  .put(protect, sellerOnly, storeUpload.single('promoBanner'), updateDeal)
  .delete(protect, sellerOnly, deleteDeal);

router.post('/price-drop', protect, sellerOnly, createPriceDrop);
router.get('/price-history/:listingId', protect, getPriceHistory);

module.exports = router;
