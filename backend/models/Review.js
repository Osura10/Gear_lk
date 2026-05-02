const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  listing: {
    type: mongoose.Schema.ObjectId,
    ref: 'Listing',
  },
  store: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store',
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: [true, 'Please add a rating between 1 and 5'],
    min: 1,
    max: 5,
  },
  title: {
    type: String,
    required: [true, 'Please add a review title'],
    trim: true,
  },
  comment: {
    type: String,
    required: [true, 'Please add a comment'],
  },
  mediaUrls: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'hidden'],
    default: 'pending',
  },
  reply: {
    seller: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    comment: {
      type: String,
    },
    repliedAt: {
      type: Date,
    }
  },
  moderation: {
    admin: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    note: {
      type: String,
    },
    moderatedAt: {
      type: Date,
    }
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

module.exports = mongoose.model('Review', ReviewSchema);
