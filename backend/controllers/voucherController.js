const Voucher = require('../models/Voucher');
const { cloudinary } = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Voucher image storage
const voucherStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'gearlk/vouchers',
    format: async () => 'jpg',
    transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }],
  },
});
const voucherUpload = multer({ storage: voucherStorage, limits: { fileSize: 5000000 } });

// ─── GET /api/vouchers  (seller/admin — list all) ────────────────────────────
exports.getVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find({ createdBy: req.user._id }).sort('-createdAt');
    res.json({ success: true, count: vouchers.length, data: vouchers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/vouchers/public  (buyer — see active available vouchers) ────────
exports.getPublicVouchers = async (req, res) => {
  try {
    const now = new Date();
    const vouchers = await Voucher.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).select('code title description discountType discountValue maxDiscountAmount minOrderAmount endDate imageUrl bannerUrl promoImageUrl');
    res.json({ success: true, data: vouchers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/vouchers/:id ────────────────────────────────────────────────────
exports.getVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id).populate('createdBy', 'name');
    if (!voucher) return res.status(404).json({ success: false, message: 'Voucher not found' });
    res.json({ success: true, data: voucher });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── POST /api/vouchers  (seller/admin) ──────────────────────────────────────
exports.createVoucher = async (req, res) => {
  try {
    const data = { ...req.body, createdBy: req.user._id };

    if (req.files) {
      if (req.files.image?.[0]) data.imageUrl = req.files.image[0].path;
      if (req.files.banner?.[0]) data.bannerUrl = req.files.banner[0].path;
      if (req.files.promoImage?.[0]) data.promoImageUrl = req.files.promoImage[0].path;
    }

    const voucher = await Voucher.create(data);
    res.status(201).json({ success: true, data: voucher });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── PUT /api/vouchers/:id  (seller/admin) ───────────────────────────────────
exports.updateVoucher = async (req, res) => {
  try {
    let voucher = await Voucher.findById(req.params.id);
    if (!voucher) return res.status(404).json({ success: false, message: 'Voucher not found' });

    if (voucher.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updateData = { ...req.body };
    if (req.files) {
      if (req.files.image?.[0]) updateData.imageUrl = req.files.image[0].path;
      if (req.files.banner?.[0]) updateData.bannerUrl = req.files.banner[0].path;
      if (req.files.promoImage?.[0]) updateData.promoImageUrl = req.files.promoImage[0].path;
    }

    voucher = await Voucher.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    res.json({ success: true, data: voucher });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DELETE /api/vouchers/:id  (seller/admin) ────────────────────────────────
exports.deleteVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) return res.status(404).json({ success: false, message: 'Voucher not found' });

    if (voucher.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await voucher.deleteOne();
    res.json({ success: true, message: 'Voucher deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.voucherUpload = voucherUpload;
