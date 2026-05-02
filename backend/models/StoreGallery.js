const mongoose = require('mongoose');

const StoreGallerySchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  caption: String,
  displayOrder: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('StoreGallery', StoreGallerySchema);
