




const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticateUser } = require('../middleware/auth');
const { messageController } = require('../controllers');
const {
  sendMessage,
  getConversationMessages,
  getConversations,
  getUnreadCount
} = messageController;


router.get('/conversations', authenticateUser, getConversations);


router.get('/unread', authenticateUser, getUnreadCount);


router.get('/conversation/:userId', authenticateUser, getConversationMessages);


router.post(
  '/',
  [
    authenticateUser,
    body('receiverId').notEmpty().withMessage('Receiver ID is required'),
    body('content').notEmpty().withMessage('Message cannot be empty'),
    body('propertyId').optional(),
    validate
  ],
  sendMessage
);

module.exports = router;
