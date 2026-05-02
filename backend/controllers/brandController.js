const Brand = require('../models/Brand');
const Listing = require('../models/Listing');

// @desc    Create brand
// @route   POST /api/brands
// @access  Private (Admin)
exports.createBrand = async (req, res) => {
  try {
    const brandData = { ...req.body };
    
    if (req.file) {
      brandData.logoUrl = req.file.path.replace(/\\/g, '/');
    }

    const brand = await Brand.create(brandData);
    res.status(201).json({ success: true, data: brand });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all brands
// @route   GET /api/brands
// @access  Public
exports.getBrands = async (req, res) => {
  try {
    const brands = await Brand.find();
    res.status(200).json({ success: true, count: brands.length, data: brands });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single brand
// @route   GET /api/brands/:id
// @access  Public
exports.getBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ success: false, message: 'Brand not found' });
    res.status(200).json({ success: true, data: brand });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update brand
// @route   PUT /api/brands/:id
// @access  Private (Admin)
exports.updateBrand = async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    if (req.file) {
      updateData.logoUrl = req.file.path.replace(/\\/g, '/');
    }

    const brand = await Brand.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });
    if (!brand) return res.status(404).json({ success: false, message: 'Brand not found' });
    res.status(200).json({ success: true, data: brand });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete brand
// @route   DELETE /api/brands/:id
// @access  Private (Admin)
exports.deleteBrand = async (req, res) => {
  try {
    // Check if used by active listings
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ success: false, message: 'Brand not found' });

    // Check if used by active listings (by ID or by name)
    const hasListings = await Listing.findOne({ 
      $or: [{ brand: req.params.id }, { brand: brand.name }] 
    });
    if (hasListings) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete brand that is used by active listings. Deactivate it instead.' 
      });
    }

    await brand.deleteOne();
    res.status(200).json({ success: true, message: 'Brand removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
