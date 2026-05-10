




const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Bookmark } = require('../models');


exports.register = async (req, res) => {
  try {
    const { email, password, displayName, phoneNumber } = req.body;

    
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    
    const password_hash = await bcrypt.hash(password, 10);

    
    const user = await User.create({
      email,
      password_hash,
      display_name: displayName,
      phone_number: phoneNumber || null
    });

    
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.display_name,
        phoneNumber: user.phone_number
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.display_name,
        phoneNumber: user.phone_number,
        profileImageUrl: user.profile_image_url
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};


exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    
    const user = await User.findById(userId).select('-password_hash');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    
    const bookmarkCount = await Bookmark.countDocuments({ user_id: userId });

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.display_name,
        phoneNumber: user.phone_number,
        profileImageUrl: user.profile_image_url,
        createdAt: user.created_at,
        bookmarksCount: bookmarkCount
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};


exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { displayName, phoneNumber, profileImageUrl } = req.body;

    
    const user = await User.findByIdAndUpdate(
      userId,
      {
        display_name: displayName,
        phone_number: phoneNumber,
        profile_image_url: profileImageUrl
      },
      { new: true, select: '-password_hash' }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        displayName: user.display_name,
        phoneNumber: user.phone_number,
        profileImageUrl: user.profile_image_url
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};
