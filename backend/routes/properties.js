




const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticateUser, optionalAuth } = require('../middleware/auth');
const { propertyController } = require('../controllers');
const {
  createProperty,
  getAllProperties,
  getFeaturedProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getUserProperties
} = propertyController;


router.get('/featured', getFeaturedProperties);


router.get('/user/my-listings', authenticateUser, getUserProperties);


router.get('/', getAllProperties);


router.get('/:id', getPropertyById);


router.post('/', authenticateUser, createProperty);


router.put('/:id', authenticateUser, updateProperty);


router.delete('/:id', authenticateUser, deleteProperty);

module.exports = router;
