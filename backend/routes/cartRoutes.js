const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyVoucher,
  removeVoucher,
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/item/:listingId', updateCartItem);
router.delete('/remove/:listingId', removeFromCart);
router.delete('/clear', clearCart);
router.post('/apply-voucher', applyVoucher);
router.delete('/remove-voucher', removeVoucher);

module.exports = router;
