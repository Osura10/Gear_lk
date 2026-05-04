const StoreGallery = require('../models/StoreGallery');
const Store = require('../models/Store');

// @desc    Upload gallery image
// @route   POST /api/stores/:storeId/gallery
// @access  Private
exports.uploadGalleryImage = async (req, res) => {
  try {
    const store = await Store.findById(req.params.storeId);
    if (!store) return res.status(404).json({ success: false, message: 'Store not found' });

    if (store.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image' });
    }

    const galleryItem = await StoreGallery.create({
      store: req.params.storeId,
      imageUrl: req.file.path.replace(/\\/g, '/'), // Cloudinary URL
      caption: req.body.caption,
      displayOrder: req.body.displayOrder
    });

    res.status(201).json({ success: true, data: galleryItem });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get store gallery
// @route   GET /api/stores/:storeId/gallery
// @access  Public
exports.getStoreGallery = async (req, res) => {
  try {
    const gallery = await StoreGallery.find({ store: req.params.storeId }).sort('displayOrder');
    res.status(200).json({ success: true, count: gallery.length, data: gallery });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update image caption/order
// @route   PUT /api/gallery/:id
// @access  Private
exports.updateGalleryItem = async (req, res) => {
  try {
    let item = await StoreGallery.findById(req.params.id).populate('store');
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    if (item.store.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    item = await StoreGallery.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete gallery image
// @route   DELETE /api/gallery/:id
// @access  Private
exports.deleteGalleryItem = async (req, res) => {
  try {
    const item = await StoreGallery.findById(req.params.id).populate('store');
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    if (item.store.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await item.deleteOne();
    res.status(200).json({ success: true, message: 'Image deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
