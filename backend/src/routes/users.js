const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { db } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

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
