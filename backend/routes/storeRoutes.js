const express = require('express');
const { 
  getStores, 
  getStoreById, 
  getStoreBySellerId, 
  getMyStore,
  createStore, 
  updateStore, 
  deleteStore,
  uploadLogo,
  uploadBanner
} = require('../controllers/storeController');
const { 
  uploadGalleryImage, 
  getStoreGallery, 
  updateGalleryItem, 
  deleteGalleryItem 
} = require('../controllers/galleryController');
const { 
  createSection, 
  getSections, 
  updateSection, 
  deleteSection 
} = require('../controllers/sectionController');
const { 
  createPolicy, 
  getPolicies, 
  getPolicyById, 
  updatePolicy, 
  deletePolicy 
} = require('../controllers/policyController');

const { protect } = require('../middleware/auth');
const { storeUpload } = require('../middleware/upload');

const router = express.Router();

// --- Stores ---
router.route('/')
  .get(getStores)
  .post(protect, storeUpload.fields([{ name: 'logo', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), createStore);

router.get('/me', protect, getMyStore);

router.route('/:id')
  .get(getStoreById)
  .put(protect, storeUpload.fields([{ name: 'logo', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), updateStore)
  .delete(protect, deleteStore);

router.get('/seller/:sellerId', getStoreBySellerId);

// Profile Media
router.put('/:id/logo', protect, storeUpload.single('logo'), uploadLogo);
router.put('/:id/banner', protect, storeUpload.single('banner'), uploadBanner);

// --- Gallery ---
router.route('/:storeId/gallery')
  .get(getStoreGallery)
  .post(protect, storeUpload.single('image'), uploadGalleryImage);

router.route('/:storeId/gallery/:id') // Changed to match requested nesting
  .put(protect, updateGalleryItem)
  .delete(protect, deleteGalleryItem);

// --- Sections ---
router.route('/:storeId/sections')
  .get(getSections)
  .post(protect, createSection);

router.route('/:storeId/sections/:id') // Changed to match requested nesting
  .put(protect, updateSection)
  .delete(protect, deleteSection);

// --- Policies ---
router.route('/:storeId/policies')
  .get(getPolicies)
  .post(protect, createPolicy);

router.route('/:storeId/policies/:id') // Changed to match requested nesting
  .get(getPolicyById)
  .put(protect, updatePolicy)
  .delete(protect, deletePolicy);

module.exports = router;
