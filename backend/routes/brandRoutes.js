const express = require('express');
const {
  getBrands,
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand,
} = require('../controllers/brandController');
const { protect, authorize } = require('../middleware/auth');

const { upload } = require('../middleware/upload');

const router = express.Router();

router.route('/')
  .get(getBrands)
  .post(protect, authorize('admin', 'seller'), upload.single('logo'), createBrand);

router.route('/:id')
  .get(getBrand)
  .put(protect, authorize('admin', 'seller'), upload.single('logo'), updateBrand)
  .delete(protect, authorize('admin'), deleteBrand);

module.exports = router;
