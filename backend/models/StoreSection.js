const mongoose = require('mongoose');

const StoreSectionSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  displayOrder: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model('StoreSection', StoreSectionSchema);
