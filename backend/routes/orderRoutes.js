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

router.use(protect);

router.post('/checkout', checkout);
router.get('/my-orders', getMyOrders);
router.get('/incoming', getIncomingOrders);
router.put('/:id/status', updateOrderStatus);
router.post('/', createOrder);

module.exports = router;
