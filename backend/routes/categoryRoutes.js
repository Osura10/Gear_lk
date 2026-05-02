const express = require('express');
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');

const { upload } = require('../middleware/upload');

const router = express.Router();

router.route('/')
  .get(getCategories)
  .post(protect, authorize('admin', 'seller'), upload.single('icon'), createCategory);

router.route('/:id')
  .get(getCategory)
  .put(protect, authorize('admin', 'seller'), upload.single('icon'), updateCategory)
  .delete(protect, authorize('admin'), deleteCategory);

module.exports = router;
