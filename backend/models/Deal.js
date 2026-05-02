const mongoose = require('mongoose');

const DealSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  store: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store',
    required: true,
  },
  listing: {
    type: mongoose.Schema.ObjectId,
    ref: 'Listing',
    required: true,
  },
  dealTitle: {
    type: String,
    required: [true, 'Please add a deal title'],
    trim: true,
  },
  dealDescription: {
    type: String,
  },
  originalPrice: {
    type: Number,
    required: true,
  },
  discountPrice: {
    type: Number,
    required: true,
  },
  discountPercentage: {
    type: Number,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'scheduled', 'expired'],
    default: 'scheduled',
  },
  promoBannerUrl: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true
});

// Calculate discount percentage before saving
DealSchema.pre('save', function(next) {
  if (this.originalPrice && this.discountPrice) {
    this.discountPercentage = Math.round(((this.originalPrice - this.discountPrice) / this.originalPrice) * 100);
  }
  next();
});

module.exports = mongoose.model('Deal', DealSchema);
