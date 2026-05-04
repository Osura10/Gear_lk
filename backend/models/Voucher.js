const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Please add a voucher code'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true,
    default: 'percentage',
  },
  discountValue: {
    type: Number,
    required: [true, 'Please add a discount value'],
    min: 0,
  },
  maxDiscountAmount: {
    type: Number, // cap for percentage discounts
    default: null,
  },
  minOrderAmount: {
    type: Number,
    default: 0,
  },
  usageLimit: {
    type: Number,
    default: null, // null = unlimited
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  perUserLimit: {
    type: Number,
    default: 1,
  },
  usedBy: [
    {
      user: { type: mongoose.Schema.ObjectId, ref: 'User' },
      usedAt: { type: Date, default: Date.now },
    },
  ],
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: [true, 'Please add an expiry date'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // Optional promotional media
  imageUrl: {
    type: String,
    default: null,
  },
  bannerUrl: {
    type: String,
    default: null,
  },
  promoImageUrl: {
    type: String,
    default: null,
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Index for fast code lookup
voucherSchema.index({ code: 1 });

module.exports = mongoose.model('Voucher', voucherSchema);
