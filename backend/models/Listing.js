const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  store: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store',
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
  },
  brand: {
    type: String,
    required: [true, 'Please add a brand'],
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
  },
  model: {
    type: String,
  },
  condition: {
    type: String,
    required: [true, 'Please add a condition'],
    default: 'Used'
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
  },
  stockQuantity: {
    type: Number,
    default: 1
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  specifications: {
    type: String,
  },
  location: {
    type: String,
    required: [true, 'Please add a location'],
  },
  district: {
    type: String,
    required: [true, 'Please add a district'],
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'sold', 'draft'],
    default: 'active',
  },
  photos: {
    type: [String],
    default: []
  },
  demoMediaUrls: {
    type: [String],
    default: []
  },
  manualPdfUrl: {
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

module.exports = mongoose.model('Listing', listingSchema);
