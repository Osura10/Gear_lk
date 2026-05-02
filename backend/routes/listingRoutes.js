const express = require('express');
const {
  getListings,
  getListing,
  createListing,
  getMyListings,
  updateListing,
  deleteListing,
  updateListingStatus,
} = require('../controllers/listingController');
const { protect, sellerOnly } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

router.route('/')
  .get(getListings)
  .post(protect, sellerOnly, upload.array('photos', 5), createListing);

router.get('/seller/my-listings', protect, sellerOnly, getMyListings);

router.route('/:id')
  .get(getListing)
  .put(protect, sellerOnly, upload.array('photos', 5), updateListing)
  .delete(protect, sellerOnly, deleteListing);

router.patch('/:id/status', protect, sellerOnly, updateListingStatus);

module.exports = router;
