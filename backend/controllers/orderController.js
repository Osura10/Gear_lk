const Order = require('../models/Order');
const Cart = require('../models/Cart');

// @desc    Create new orders from cart (Checkout)
// @route   POST /api/orders/checkout
// @access  Private
exports.checkout = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.listing');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    const { message, voucherCode } = req.body;
    const voucherImage = req.file ? req.file.path.replace(/\\/g, '/') : null;

    const orders = [];
    for (const item of cart.items) {
      const order = await Order.create({
        listing: item.listing._id,
        buyer: req.user._id,
        seller: item.listing.seller,
        totalPrice: item.listing.price * item.quantity,
        message: message || '',
        voucherCode: voucherCode || (cart.appliedVoucher ? cart.appliedVoucher.code : null),
        voucherImage,
        note: item.note,
      });
      orders.push(order);
    }

    // Clear cart after checkout
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    res.status(201).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get buyer's orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate('listing', 'title price photos')
      .populate('seller', 'name email phone')
      .sort('-createdAt');
      
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get seller's incoming orders (Purchase Requests)
// @route   GET /api/orders/incoming
// @access  Private (Seller only)
exports.getIncomingOrders = async (req, res) => {
  try {
    const orders = await Order.find({ seller: req.user._id })
      .populate('listing', 'title price photos')
      .populate('buyer', 'name email phone')
      .sort('-createdAt');
      
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Seller only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    let order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Only seller can update status
    if (order.seller.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    order.status = status;
    await order.save();

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a single order (from Details page)
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const order = await Order.create({
      ...req.body,
      buyer: req.user._id
    });
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
