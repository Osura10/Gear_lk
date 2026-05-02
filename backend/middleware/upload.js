const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/listings/');
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// Check file type for listings (Images, Video, Audio, PDF)
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|webp|heic|heif|mp4|mov|mp3|wav|pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  
  if (extname) {
    return cb(null, true);
  } else {
    cb('Error: File type not supported!');
  }
}

// Check file type for store assets (Images Only)
function checkStoreFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  
  if (extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only (jpeg, jpg, png, webp)!');
  }
}

// Init upload for listings
const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// Storage for stores
const storeStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/stores/');
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `store-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const storeUpload = multer({
  storage: storeStorage,
  limits: { fileSize: 5000000 },
  fileFilter: function (req, file, cb) {
    checkStoreFileType(file, cb);
  },
});

module.exports = { upload, storeUpload };
