




const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const { bookmarkController } = require('../controllers');
const {
  toggleBookmark,
  getUserBookmarks,
  checkBookmark
} = bookmarkController;


router.get('/', authenticateUser, getUserBookmarks);


router.post('/:propertyId', authenticateUser, toggleBookmark);


router.get('/check/:propertyId', authenticateUser, checkBookmark);

module.exports = router;
