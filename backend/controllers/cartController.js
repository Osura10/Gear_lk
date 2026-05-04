const Cart = require('../models/Cart');
const Listing = require('../models/Listing');
const Voucher = require('../models/Voucher');

// ─── Helper: Recalculate totals ──────────────────────────────────────────────
const recalculateTotals = async (cart) => {
  // Populate item prices
  let subTotal = 0;
  for (const item of cart.items) {
    const listing = await Listing.findById(item.listing);
    if (listing) {
      subTotal += listing.price * item.quantity;
    }
  }
  cart.subTotal = subTotal;

  // Re-apply voucher discount
  let discountAmount = 0;
  if (cart.appliedVoucher && cart.appliedVoucher.voucherId) {
    const voucher = await Voucher.findById(cart.appliedVoucher.voucherId);
    if (voucher && voucher.isActive) {
      if (voucher.discountType === 'percentage') {
        discountAmount = (subTotal * voucher.discountValue) / 100;
        if (voucher.maxDiscountAmount) {
          discountAmount = Math.min(discountAmount, voucher.maxDiscountAmount);
        }
      } else {
        discountAmount = Math.min(voucher.discountValue, subTotal);
      }
    } else {
      // Voucher no longer valid — remove it
      cart.appliedVoucher = {};
    }
  }

  cart.discountAmount = discountAmount;
  cart.totalPrice = Math.max(0, subTotal - discountAmount);
  return cart;
};

// ─── GET /api/cart ────────────────────────────────────────────────────────────
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.listing');
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── POST /api/cart/add ───────────────────────────────────────────────────────
exports.addToCart = async (req, res) => {
  try {
    const { listingId, quantity = 1, note = '' } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.listing.toString() === listingId
    );

    if (itemIndex > -1) {
      return res.status(400).json({ success: false, message: 'Item already in cart' });
    }

    cart.items.push({ listing: listingId, quantity, note });
    cart = await recalculateTotals(cart);
    await cart.save();

    await cart.populate('items.listing');
    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── PUT /api/cart/item/:listingId ────────────────────────────────────────────
exports.updateCartItem = async (req, res) => {
  try {
    const { quantity, note } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.find(
      (i) => i.listing.toString() === req.params.listingId
    );
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not in cart' });
    }

    if (quantity !== undefined) item.quantity = Math.max(1, quantity);
    if (note !== undefined) item.note = note;

    cart = await recalculateTotals(cart);
    await cart.save();
    await cart.populate('items.listing');
    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DELETE /api/cart/remove/:listingId ──────────────────────────────────────
exports.removeFromCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      (item) => item.listing.toString() !== req.params.listingId
    );

    cart = await recalculateTotals(cart);
    await cart.save();
    await cart.populate('items.listing');
    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DELETE /api/cart/clear ───────────────────────────────────────────────────
exports.clearCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      cart.appliedVoucher = {};
      cart.subTotal = 0;
      cart.discountAmount = 0;
      cart.totalPrice = 0;
      await cart.save();
    }
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── POST /api/cart/apply-voucher ─────────────────────────────────────────────
exports.applyVoucher = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Voucher code is required' });
    }

    const voucher = await Voucher.findOne({ code: code.toUpperCase(), isActive: true });
    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Invalid or expired voucher code' });
    }

    const now = new Date();
    if (now < voucher.startDate || now > voucher.endDate) {
      return res.status(400).json({ success: false, message: 'Voucher is not valid at this time' });
    }

    if (voucher.usageLimit !== null && voucher.usageCount >= voucher.usageLimit) {
      return res.status(400).json({ success: false, message: 'Voucher usage limit reached' });
    }

    const userUsage = voucher.usedBy.filter(
      (u) => u.user.toString() === req.user._id.toString()
    ).length;
    if (userUsage >= voucher.perUserLimit) {
      return res.status(400).json({ success: false, message: 'You have already used this voucher' });
    }

    let cart = await Cart.findOne({ user: req.user._id }).populate('items.listing');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    if (cart.subTotal < voucher.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of Rs. ${voucher.minOrderAmount.toLocaleString()} required`,
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (voucher.discountType === 'percentage') {
      discountAmount = (cart.subTotal * voucher.discountValue) / 100;
      if (voucher.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, voucher.maxDiscountAmount);
      }
    } else {
      discountAmount = Math.min(voucher.discountValue, cart.subTotal);
    }

    cart.appliedVoucher = {
      voucherId: voucher._id,
      code: voucher.code,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
      discountAmount,
    };

    cart.discountAmount = discountAmount;
    cart.totalPrice = Math.max(0, cart.subTotal - discountAmount);
    await cart.save();

    res.json({
      success: true,
      data: cart,
      message: `Voucher applied! You save Rs. ${discountAmount.toLocaleString()}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DELETE /api/cart/remove-voucher ─────────────────────────────────────────
exports.removeVoucher = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.appliedVoucher = {};
    cart.discountAmount = 0;
    cart.totalPrice = cart.subTotal;
    await cart.save();
    await cart.populate('items.listing');

    res.json({ success: true, data: cart, message: 'Voucher removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
