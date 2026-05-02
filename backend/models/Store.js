const mongoose = require('mongoose');

const StoreSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Please add a store name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  businessName: {
    type: String,
    required: [true, 'Please add a business name']
  },
  email: {
    type: String,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
  },
  contactNumber: String,
  location: {
    type: String,
    required: [true, 'Please add a location']
  },
  category: {
    type: String,
    required: [true, 'Please add a specialty/category']
  },
  openingDate: Date,
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'pending'
  },
  logoUrl: {
    type: String,
    default: 'no-photo.jpg'
  },
  bannerUrl: {
    type: String,
    default: 'no-banner.jpg'
  },
  rating: {
    type: Number,
    default: 0
  },
  reviewsCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Store', StoreSchema);
