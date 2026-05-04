const express = require('express');
const router = express.Router();
const { 
  checkout, 
  getMyOrders, 
  getIncomingOrders, 
  updateOrderStatus,
  createOrder 
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.use(protect);

router.post('/checkout', upload.single('voucherImage'), checkout);
router.get('/my-orders', getMyOrders);
router.get('/incoming', getIncomingOrders);
router.put('/:id/status', updateOrderStatus);
router.post('/', createOrder);

module.exports = router;
