const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// @desc    Start or find a conversation
// @route   POST /api/conversations/start
// @access  Private
exports.startConversation = async (req, res) => {
  try {
    const { sellerId, listingId } = req.body;
    const buyerId = req.user._id;

    // Check if conversation already exists for this listing between these users
    let conversation = await Conversation.findOne({
      listing: listingId,
      participants: { $all: [buyerId, sellerId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [buyerId, sellerId],
        listing: listingId,
      });
    }

    res.json({ success: true, data: conversation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's conversations
// @route   GET /api/conversations
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: { $in: [req.user._id] },
    })
      .populate('participants', 'name')
      .populate('listing', 'title photos')
      .sort('-updatedAt');

    res.json({ success: true, data: conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    // Check if user is participant
    if (!conversation.participants.includes(req.user._id)) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const messages = await Message.find({ conversation: req.params.conversationId })
      .sort('createdAt');

    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send a message
// @route   POST /api/messages/:conversationId
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const conversationId = req.params.conversationId;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      text,
    });

    // Update conversation last message and timestamp
    conversation.lastMessage = text;
    conversation.updatedAt = Date.now();
    await conversation.save();

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
