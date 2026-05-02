const Category = require('../models/Category');
const Listing = require('../models/Listing');

// @desc    Create category
// @route   POST /api/categories
// @access  Private (Admin)
exports.createCategory = async (req, res) => {
  try {
    const categoryData = { ...req.body };
    if (req.file) {
      categoryData.icon = req.file.path.replace(/\\/g, '/');
    }

    const category = await Category.create(categoryData);
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate('parentCategory', 'name');
    res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate('parentCategory', 'name');
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.status(200).json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin)
exports.updateCategory = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.icon = req.file.path.replace(/\\/g, '/');
    }

    const category = await Category.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.status(200).json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
exports.deleteCategory = async (req, res) => {
  try {
    // Check if used by active listings
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    // Check if used by active listings (by ID or by name)
    const hasListings = await Listing.findOne({ 
      $or: [{ category: req.params.id }, { category: category.name }] 
    });
    if (hasListings) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete category that is used by active listings. Deactivate it instead.' 
      });
    }

    await category.deleteOne();
    res.status(200).json({ success: true, message: 'Category removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
