const express = require('express');
const router = express.Router();
const {
  getVouchers,
  getPublicVouchers,
  getVoucher,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  voucherUpload,
} = require('../controllers/voucherController');
const { protect } = require('../middleware/auth');

const uploadFields = voucherUpload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'banner', maxCount: 1 },
  { name: 'promoImage', maxCount: 1 },
]);

// Middleware: allow seller or admin
const sellerOrAdmin = (req, res, next) => {
  if (req.user.role !== 'seller' && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Only sellers and admins can manage vouchers' });
  }
  next();
};

// Public — buyers can browse available vouchers
router.get('/public', getPublicVouchers);

// Protected — sellers/admins manage vouchers
router.use(protect);
router.get('/', sellerOrAdmin, getVouchers);
router.get('/:id', sellerOrAdmin, getVoucher);
router.post('/', sellerOrAdmin, uploadFields, createVoucher);
router.put('/:id', sellerOrAdmin, uploadFields, updateVoucher);
router.delete('/:id', sellerOrAdmin, deleteVoucher);

module.exports = router;

