const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { db } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Get all users from JSON file
router.get('/get-all-users', (req, res) => {
  try {
    const usersPath = path.join(__dirname, '../../data/users.json');
    
    // Check if file exists
    if (!fs.existsSync(usersPath)) {
      return res.status(404).json({ error: 'Users data file not found' });
    }
    
    // Read and parse the JSON file
    const usersData = fs.readFileSync(usersPath, 'utf8');
    const users = JSON.parse(usersData);
    
    // Return all users (excluding sensitive info like passwords in a real app)
    const safeUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      avatarColor: user.avatarColor,
      // Note: In production, you'd want to exclude passwords
      // password: user.password // Only for development/hackathon
    }));
    
    res.json({
      success: true,
      count: safeUsers.length,
      users: safeUsers
    });
    
  } catch (error) {
    console.error('Error reading users:', error);
    res.status(500).json({ 
      error: 'Failed to read users data',
      message: error.message 
    });
  }
});

// Login endpoint - validates user credentials
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const usersPath = path.join(__dirname, '../../data/users.json');
    
    // Check if file exists
    if (!fs.existsSync(usersPath)) {
      return res.status(500).json({ error: 'Users data file not found' });
    }
    
    // Read existing users
    const usersData = fs.readFileSync(usersPath, 'utf8');
    const users = JSON.parse(usersData);
    
    // Find user with matching email and password
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      // Login successful - return user data (excluding password)
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({
        success: true,
        message: 'Login successful',
        user: userWithoutPassword
      });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Failed to authenticate user',
      message: error.message 
    });
  }
});

// Update user profile endpoint
router.put('/profile', [
  body('name').optional().trim().escape(),
  body('email').optional().isEmail().normalizeEmail(),
  body('avatarColor').optional().trim()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, avatarColor } = req.body;
    const usersPath = path.join(__dirname, '../../data/users.json');
    
    // Check if file exists
    if (!fs.existsSync(usersPath)) {
      return res.status(500).json({ error: 'Users data file not found' });
    }
    
    // Read existing users
    const usersData = fs.readFileSync(usersPath, 'utf8');
    const users = JSON.parse(usersData);
    
    // For now, we'll update the first user (in a real app, you'd get this from auth)
    // You can modify this to find by email or other identifier
    const userIndex = 0; // Update first user for demo purposes
    
    if (userIndex >= 0) {
      // Update user fields
      if (name !== undefined) users[userIndex].name = name;
      if (email !== undefined) users[userIndex].email = email;
      if (avatarColor !== undefined) users[userIndex].avatarColor = avatarColor;
      
      // Add updated timestamp
      users[userIndex].updatedAt = new Date().toISOString();
      
      // Write back to file
      fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf8');
      
      // Return updated user (excluding password)
      const { password: _, ...updatedUser } = users[userIndex];
      
      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser
      });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
    
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ 
      error: 'Failed to update profile',
      message: error.message 
    });
  }
});

// Sign up endpoint - adds new user to users.json file
router.post('/signup', [
  body('name').notEmpty().trim().escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    const { name, email, password } = req.body;
    const usersPath = path.join(__dirname, '../../data/users.json');
    
    // Check if file exists
    if (!fs.existsSync(usersPath)) {
      return res.status(500).json({ error: 'Users data file not found' });
    }
    
    // Read existing users
    const usersData = fs.readFileSync(usersPath, 'utf8');
    const users = JSON.parse(usersData);
    
    // Check if email already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    // Generate a random avatar color from the brand palette
    const brandColors = ['#7553ff', '#ff45a8', '#ee8019', '#fdb81b', '#92dd00', '#226dfc'];
    const randomColor = brandColors[Math.floor(Math.random() * brandColors.length)];
    
    // Create new user
    const newUser = {
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
      name: name,
      email: email,
      password: password, // In production, this should be hashed
      avatarColor: randomColor,
      createdAt: new Date().toISOString()
    };
    
    // Add new user to array
    users.push(newUser);
    
    // Write back to file
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf8');
    
    // Return success (excluding password)
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: userWithoutPassword
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      error: 'Failed to create user',
      message: error.message 
    });
  }
});



// Update user profile
router.put('/profile', authenticateToken, [
  body('username').optional().isLength({ min: 3 }).trim().escape(),
  body('email').optional().isEmail().normalizeEmail(),
  body('bio').optional().trim().escape(),
  body('avatar').optional().trim()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, bio, avatar } = req.body;
    const userId = req.user.userId;

    // Check if username or email already exists (if being updated)
    if (username || email) {
      const checkQuery = 'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?';
      const checkParams = [username || '', email || '', userId];
      
      db.get(checkQuery, checkParams, (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (row) {
          return res.status(400).json({ error: 'Username or email already exists' });
        }

        // Update profile
        updateProfile();
      });
    } else {
      updateProfile();
    }

    function updateProfile() {
      const updateFields = [];
      const updateParams = [];
      
      if (username) {
        updateFields.push('username = ?');
        updateParams.push(username);
      }
      if (email) {
        updateFields.push('email = ?');
        updateParams.push(email);
      }
      if (bio !== undefined) {
        updateFields.push('bio = ?');
        updateParams.push(bio);
      }
      if (avatar !== undefined) {
        updateFields.push('avatar = ?');
        updateParams.push(avatar);
      }
      
      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateParams.push(userId);

      const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
      
      db.run(updateQuery, updateParams, function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to update profile' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'Profile updated successfully' });
      });
    }
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change password
router.put('/password', authenticateToken, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    // Get current password hash
    db.get('SELECT password_hash FROM users WHERE id = ?', [userId], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      // Hash new password
      const saltRounds = 12;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      db.run(
        'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newPasswordHash, userId],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to update password' });
          }

          res.json({ message: 'Password updated successfully' });
        }
      );
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user account
router.delete('/account', authenticateToken, (req, res) => {
  const userId = req.user.userId;

  db.run('DELETE FROM users WHERE id = ?', [userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete account' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Account deleted successfully' });
  });
});

// Get user statistics
router.get('/stats', authenticateToken, (req, res) => {
  const userId = req.user.userId;

  db.get(`
    SELECT 
      COUNT(*) as totalEateries,
      AVG(rating) as averageRating,
      COUNT(CASE WHEN dietary_options LIKE '%vegan%' THEN 1 END) as veganCount
    FROM eateries 
    WHERE user_id = ?
  `, [userId], (err, stats) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({
      stats: {
        totalEateries: stats.totalEateries || 0,
        averageRating: stats.averageRating ? parseFloat(stats.averageRating).toFixed(1) : 0,
        veganCount: stats.veganCount || 0
      }
    });
  });
});

module.exports = router;
