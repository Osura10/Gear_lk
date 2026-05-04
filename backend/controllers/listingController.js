const Listing = require('../models/Listing');
const Store = require('../models/Store');

// @desc    Create listing
// @route   POST /api/listings
// @access  Private (Seller)
exports.createListing = async (req, res) => {
  try {
    // Check if seller has a store
    const store = await Store.findOne({ seller: req.user.id });
    
    const listingData = {
      ...req.body,
      seller: req.user.id,
      store: store ? store._id : null
    };

    if (req.files && req.files.length > 0) {
      listingData.photos = req.files.map(file => file.path.replace(/\\/g, '/'));
      console.log('✅ Photos uploaded to Cloudinary:', listingData.photos);
    }

    const listing = await Listing.create(listingData);

    res.status(201).json({ success: true, data: listing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all listings
// @route   GET /api/listings
// @access  Public
exports.getListings = async (req, res) => {
  try {
    const query = { status: 'active' };
    
    // Optional filters
    if (req.query.category) query.category = req.query.category;
    if (req.query.seller) query.seller = req.query.seller;
    if (req.query.store) query.store = req.query.store;

    const listings = await Listing.find(query).populate('seller', 'name').populate('store', 'name logoUrl');
    res.status(200).json({ success: true, count: listings.length, data: listings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single listing
// @route   GET /api/listings/:id
// @access  Public
exports.getListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('seller', 'name email')
      .populate('store');

    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    res.status(200).json({ success: true, data: listing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get my listings
// @route   GET /api/listings/seller/my-listings
// @access  Private
exports.getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ seller: req.user.id }).sort('-createdAt');
    res.status(200).json({ success: true, count: listings.length, data: listings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update listing
// @route   PUT /api/listings/:id
// @access  Private (Owner/Admin)
exports.updateListing = async (req, res) => {
  try {
    let listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

    // Ownership check
    if (listing.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updateData = { ...req.body };
    if (req.files && req.files.length > 0) {
      updateData.photos = req.files.map(file => file.path.replace(/\\/g, '/'));
      console.log('✅ Photos updated on Cloudinary:', updateData.photos);
    }

    listing = await Listing.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: listing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete listing
// @route   DELETE /api/listings/:id
// @access  Private (Owner/Admin)
exports.deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

    if (listing.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await listing.deleteOne();
    res.status(200).json({ success: true, message: 'Listing removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update listing status
// @route   PATCH /api/listings/:id/status
// @access  Private (Owner/Admin)
exports.updateListingStatus = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

    if (listing.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    listing.status = req.body.status;
    await listing.save();

    res.status(200).json({ success: true, data: listing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
