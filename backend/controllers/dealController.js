const Deal = require('../models/Deal');
const Listing = require('../models/Listing');
const Store = require('../models/Store');
const PriceHistory = require('../models/PriceHistory');

// @desc    Create deal
// @route   POST /api/deals
// @access  Private (Seller)
exports.createDeal = async (req, res) => {
  try {
    const { listingId, discountPrice, startDate, endDate } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

    // Ownership check
    if (listing.seller.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to create a deal for this listing' });
    }

    // Validation: Discount price lower than original
    if (discountPrice >= listing.price) {
      return res.status(400).json({ success: false, message: 'Discount price must be lower than current price' });
    }

    // Validation: Dates
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ success: false, message: 'Start date must be before end date' });
    }

    const store = await Store.findOne({ seller: req.user.id });

    const deal = await Deal.create({
      ...req.body,
      listing: listingId,
      seller: req.user.id,
      store: store._id,
      originalPrice: listing.price
    });

    // Update listing status/price to reflect deal
    listing.price = discountPrice;
    listing.originalPrice = listing.originalPrice || listing.price;
    listing.dealStatus = 'active';
    await listing.save();

    res.status(201).json({ success: true, data: deal });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all deals (Seller specific or filtered)
// @route   GET /api/deals
// @access  Public
exports.getDeals = async (req, res) => {
  try {
    const query = { status: 'active' };
    if (req.query.store) query.store = req.query.store;
    if (req.query.listing) query.listing = req.query.listing;

    const deals = await Deal.find(query).populate('listing', 'title photos');
    res.status(200).json({ success: true, count: deals.length, data: deals });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create price drop
// @route   POST /api/deals/price-drop
// @access  Private (Seller)
exports.createPriceDrop = async (req, res) => {
  try {
    const { listingId, newPrice, reason } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

    if (listing.seller.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (newPrice >= listing.price) {
      return res.status(400).json({ success: false, message: 'New price must be lower for a price drop' });
    }

    // Record History
    await PriceHistory.create({
      listing: listingId,
      oldPrice: listing.price,
      newPrice,
      changeReason: reason
    });

    // Update Listing
    listing.originalPrice = listing.originalPrice || listing.price;
    listing.price = newPrice;
    await listing.save();

    res.status(200).json({ success: true, message: 'Price dropped successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get price history for a listing
// @route   GET /api/deals/price-history/:listingId
// @access  Private (Owner/Admin)
exports.getPriceHistory = async (req, res) => {
  try {
    const history = await PriceHistory.find({ listing: req.params.listingId }).sort('-changedAt');
    res.status(200).json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update deal
// @route   PUT /api/deals/:id
// @access  Private (Owner)
exports.updateDeal = async (req, res) => {
  try {
    let deal = await Deal.findById(req.params.id);
    if (!deal) return res.status(404).json({ success: false, message: 'Deal not found' });

    if (deal.seller.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    deal = await Deal.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: deal });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete deal
// @route   DELETE /api/deals/:id
// @access  Private (Owner)
exports.deleteDeal = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) return res.status(404).json({ success: false, message: 'Deal not found' });

    if (deal.seller.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Revert listing price? (Optional logic depending on business rules)
    // For now, just delete the deal object
    await deal.deleteOne();
    res.status(200).json({ success: true, message: 'Deal removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
