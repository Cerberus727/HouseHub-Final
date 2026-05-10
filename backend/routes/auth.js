




const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticateUser } = require('../middleware/auth');
const { authController } = require('../controllers');
const {
  register,
  login,
  getProfile,
  updateProfile
} = authController;


router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('displayName').notEmpty().withMessage('Display name is required'),
    validate
  ],
  register
);


router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
  ],
  login
);


router.get('/profile', authenticateUser, getProfile);


router.put(
  '/profile',
  [
    authenticateUser,
    body('displayName').optional().notEmpty().withMessage('Display name cannot be empty'),
    body('phoneNumber').optional().isString().withMessage('Invalid phone number'),
    validate
  ],
  updateProfile
);

module.exports = router;
