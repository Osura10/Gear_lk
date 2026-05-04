const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  listing: {
    type: mongoose.Schema.ObjectId,
    ref: 'Listing',
    required: true,
  },
  buyer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  seller: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed'],
    default: 'pending',
  },
  message: {
    type: String,
    default: 'I am interested in this item.',
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  voucherCode: {
    type: String,
  },
  voucherImage: {
    type: String,
  },
  note: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Order', orderSchema);
