const StoreSection = require('../models/StoreSection');
const Store = require('../models/Store');

// @desc    Create section
// @route   POST /api/stores/:storeId/sections
// @access  Private
exports.createSection = async (req, res) => {
  try {
    const store = await Store.findById(req.params.storeId);
    if (!store) return res.status(404).json({ success: false, message: 'Store not found' });

    if (store.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const section = await StoreSection.create({
      ...req.body,
      store: req.params.storeId
    });

    res.status(201).json({ success: true, data: section });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get sections by store
// @route   GET /api/stores/:storeId/sections
// @access  Public
exports.getSections = async (req, res) => {
  try {
    const sections = await StoreSection.find({ store: req.params.storeId }).sort('displayOrder');
    res.status(200).json({ success: true, count: sections.length, data: sections });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update section
// @route   PUT /api/sections/:id
// @access  Private
exports.updateSection = async (req, res) => {
  try {
    let section = await StoreSection.findById(req.params.id).populate('store');
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });

    if (section.store.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    section = await StoreSection.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: section });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete section
// @route   DELETE /api/sections/:id
// @access  Private
exports.deleteSection = async (req, res) => {
  try {
    const section = await StoreSection.findById(req.params.id).populate('store');
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });

    if (section.store.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await section.deleteOne();
    res.status(200).json({ success: true, message: 'Section deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
