const Store = require('../models/Store');

// @desc    Create store profile
// @route   POST /api/stores
// @access  Private
exports.createStore = async (req, res) => {
  try {
    const existingStore = await Store.findOne({ seller: req.user.id });
    if (existingStore) {
      return res.status(400).json({ success: false, message: 'Seller already has a store' });
    }

    const storeData = {
      ...req.body,
      seller: req.user.id
    };

    if (req.files) {
      if (req.files.logo && req.files.logo.length > 0) {
        storeData.logoUrl = req.files.logo[0].path.replace(/\\/g, '/');
      }
      if (req.files.banner && req.files.banner.length > 0) {
        storeData.bannerUrl = req.files.banner[0].path.replace(/\\/g, '/');
      }
    }

    const store = await Store.create(storeData);
    res.status(201).json({ success: true, data: store });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all stores
// @route   GET /api/stores
// @access  Public
exports.getStores = async (req, res) => {
  try {
    const stores = await Store.find().populate('seller', 'name email');
    res.status(200).json({ success: true, count: stores.length, data: stores });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get store by ID
// @route   GET /api/stores/:id
// @access  Public
exports.getStoreById = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id).populate('seller', 'name email');
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }
    res.status(200).json({ success: true, data: store });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get store by seller ID
// @route   GET /api/stores/seller/:sellerId
// @access  Public
exports.getStoreBySellerId = async (req, res) => {
  try {
    const store = await Store.findOne({ seller: req.params.sellerId });
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }
    res.status(200).json({ success: true, data: store });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get my store
// @route   GET /api/stores/me
// @access  Private (Seller)
exports.getMyStore = async (req, res) => {
  try {
    const store = await Store.findOne({ seller: req.user.id });
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }
    res.status(200).json({ success: true, data: store });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update store profile
// @route   PUT /api/stores/:id
// @access  Private (Owner/Admin)
exports.updateStore = async (req, res) => {
  try {
    let store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    // Check ownership
    if (store.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updateData = { ...req.body };

    if (req.files) {
      if (req.files.logo && req.files.logo.length > 0) {
        updateData.logoUrl = req.files.logo[0].path.replace(/\\/g, '/');
      }
      if (req.files.banner && req.files.banner.length > 0) {
        updateData.bannerUrl = req.files.banner[0].path.replace(/\\/g, '/');
      }
    }

    store = await Store.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: store });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete/Deactivate store
// @route   DELETE /api/stores/:id
// @access  Private (Owner/Admin)
exports.deleteStore = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    // Check ownership
    if (store.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Deactivate instead of delete
    store.status = 'inactive';
    await store.save();

    res.status(200).json({ success: true, message: 'Store deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Upload store logo
// @route   PUT /api/stores/:id/logo
// @access  Private
exports.uploadLogo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Please upload a logo' });
    
    const store = await Store.findByIdAndUpdate(
      req.params.id, 
      { logoUrl: req.file.path.replace(/\\/g, '/') }, 
      { new: true }
    );
    res.status(200).json({ success: true, data: store });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Upload store banner
// @route   PUT /api/stores/:id/banner
// @access  Private
exports.uploadBanner = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Please upload a banner' });

    const store = await Store.findByIdAndUpdate(
      req.params.id, 
      { bannerUrl: req.file.path.replace(/\\/g, '/') }, 
      { new: true }
    );
    res.status(200).json({ success: true, data: store });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
