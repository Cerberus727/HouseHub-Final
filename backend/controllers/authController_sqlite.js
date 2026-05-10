




const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/database');


exports.register = async (req, res) => {
  try {
    const { email, password, displayName, phoneNumber } = req.body;

    
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    
    const passwordHash = await bcrypt.hash(password, 10);

    
    const stmt = db.prepare('INSERT INTO users (email, password_hash, display_name, phone_number) VALUES (?, ?, ?, ?)');
    const result = stmt.run(email, passwordHash, displayName, phoneNumber || null);

    const user = db.prepare('SELECT id, email, display_name, phone_number FROM users WHERE id = ?').get(result.lastInsertRowid);

    
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
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

    
    const user = db.prepare('SELECT id, email, password_hash, display_name, phone_number, profile_image_url FROM users WHERE email = ?').get(email);


    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        phoneNumber: user.phone_number,
        profileImage: user.profile_image_url
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

    const user = db.prepare('SELECT id, email, display_name, phone_number, profile_image_url, created_at FROM users WHERE id = ?').get(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    
    const bookmarkCount = db.prepare('SELECT COUNT(*) as count FROM bookmarks WHERE user_id = ?').get(userId);

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        phoneNumber: user.phone_number,
        profileImage: user.profile_image_url,
        createdAt: user.created_at,
        totalBookmarks: bookmarkCount.count || 0
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
    const { displayName, phoneNumber } = req.body;

    const stmt = db.prepare('UPDATE users SET display_name = ?, phone_number = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(displayName, phoneNumber, userId);

    const user = db.prepare('SELECT id, email, display_name, phone_number, profile_image_url FROM users WHERE id = ?').get(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        phoneNumber: user.phone_number,
        profileImage: user.profile_image_url
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};
