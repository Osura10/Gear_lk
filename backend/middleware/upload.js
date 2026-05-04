const multer = require('multer');
const { storage, storeStorage } = require('../config/cloudinary');

// Init upload for listings
const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
});

// Init upload for stores
const storeUpload = multer({
  storage: storeStorage,
  limits: { fileSize: 5000000 },
});

module.exports = { upload, storeUpload };
