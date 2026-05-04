const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  items: [
    {
      listing: {
        type: mongoose.Schema.ObjectId,
        ref: 'Listing',
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
        min: 1,
      },
      note: {
        type: String,
        trim: true,
        default: '',
      },
    },
  ],
  subTotal: {
    type: Number,
    default: 0,
  },
  discountAmount: {
    type: Number,
    default: 0,
  },
  totalPrice: {
    type: Number,
    default: 0,
  },
  appliedVoucher: {
    voucherId: { type: mongoose.Schema.ObjectId, ref: 'Voucher', default: null },
    code: { type: String, default: null },
    discountType: { type: String, default: null },
    discountValue: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Cart', cartSchema);
