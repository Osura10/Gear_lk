const express = require('express');
const router = express.Router();
const { startConversation, getConversations } = require('../controllers/conversationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/start', startConversation);
router.get('/', getConversations);

module.exports = router;
