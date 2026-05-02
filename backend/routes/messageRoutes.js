const express = require('express');
const router = express.Router();
const { getMessages, sendMessage } = require('../controllers/conversationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/:conversationId', getMessages);
router.post('/:conversationId', sendMessage);

module.exports = router;
