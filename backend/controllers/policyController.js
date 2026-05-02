const StorePolicy = require('../models/StorePolicy');
const Store = require('../models/Store');

// @desc    Create policy
// @route   POST /api/stores/:storeId/policies
// @access  Private
exports.createPolicy = async (req, res) => {
  try {
    const store = await Store.findById(req.params.storeId);
    if (!store) return res.status(404).json({ success: false, message: 'Store not found' });

    if (store.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const policy = await StorePolicy.create({
      ...req.body,
      store: req.params.storeId
    });

    res.status(201).json({ success: true, data: policy });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get policies by store
// @route   GET /api/stores/:storeId/policies
// @access  Public
exports.getPolicies = async (req, res) => {
  try {
    const policies = await StorePolicy.find({ store: req.params.storeId });
    res.status(200).json({ success: true, count: policies.length, data: policies });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get policy by ID
// @route   GET /api/policies/:id
// @access  Public
exports.getPolicyById = async (req, res) => {
  try {
    const policy = await StorePolicy.findById(req.params.id);
    if (!policy) return res.status(404).json({ success: false, message: 'Policy not found' });
    res.status(200).json({ success: true, data: policy });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update policy
// @route   PUT /api/policies/:id
// @access  Private
exports.updatePolicy = async (req, res) => {
  try {
    let policy = await StorePolicy.findById(req.params.id).populate('store');
    if (!policy) return res.status(404).json({ success: false, message: 'Policy not found' });

    if (policy.store.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    policy = await StorePolicy.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: policy });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete policy
// @route   DELETE /api/policies/:id
// @access  Private
exports.deletePolicy = async (req, res) => {
  try {
    const policy = await StorePolicy.findById(req.params.id).populate('store');
    if (!policy) return res.status(404).json({ success: false, message: 'Policy not found' });

    if (policy.store.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await policy.deleteOne();
    res.status(200).json({ success: true, message: 'Policy deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
