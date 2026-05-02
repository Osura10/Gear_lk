const mongoose = require('mongoose');

const PriceHistorySchema = new mongoose.Schema({
  listing: {
    type: mongoose.Schema.ObjectId,
    ref: 'Listing',
    required: true,
  },
  oldPrice: {
    type: Number,
    required: true,
  },
  newPrice: {
    type: Number,
    required: true,
  },
  changeReason: {
    type: String,
    trim: true,
  },
  changedAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('PriceHistory', PriceHistorySchema);
