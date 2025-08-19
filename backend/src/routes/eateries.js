const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../config/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all eateries for the authenticated user
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.userId;

  db.all(`
    SELECT * FROM eateries 
    WHERE user_id = ? 
    ORDER BY created_at DESC
  `, [userId], (err, eateries) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Parse dietary options from JSON string
    const parsedEateries = eateries.map(eatery => ({
      ...eatery,
      dietaryOptions: eatery.dietary_options ? JSON.parse(eatery.dietary_options) : {},
      images: eatery.images ? JSON.parse(eatery.images) : []
    }));

    res.json({ eateries: parsedEateries });
  });
});

// Get a specific eatery by ID
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  db.get('SELECT * FROM eateries WHERE id = ? AND user_id = ?', [id, userId], (err, eatery) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!eatery) {
      return res.status(404).json({ error: 'Eatery not found' });
    }

    // Parse JSON fields
    const parsedEatery = {
      ...eatery,
      dietaryOptions: eatery.dietary_options ? JSON.parse(eatery.dietary_options) : {},
      images: eatery.images ? JSON.parse(eatery.images) : []
    };

    res.json({ eatery: parsedEatery });
  });
});

// Create a new eatery
router.post('/', authenticateToken, [
  body('name').notEmpty().trim().escape(),
  body('address').notEmpty().trim().escape(),
  body('type').notEmpty().trim().escape(),
  body('cuisine').optional().trim().escape(),
  body('rating').optional().isInt({ min: 0, max: 5 }),
  body('price').optional().trim().escape(),
  body('comment').optional().trim().escape(),
  body('dietaryOptions').optional().isObject(),
  body('images').optional().isArray()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name, address, type, cuisine, rating = 0, price, comment, dietaryOptions = {}, images = []
    } = req.body;
    const userId = req.user.userId;

    // Convert objects to JSON strings for storage
    const dietaryOptionsJson = JSON.stringify(dietaryOptions);
    const imagesJson = JSON.stringify(images);

    db.run(`
      INSERT INTO eateries (
        user_id, name, address, type, cuisine, rating, price, comment, 
        dietary_options, images
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [userId, name, address, type, cuisine, rating, price, comment, dietaryOptionsJson, imagesJson], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create eatery' });
      }

      res.status(201).json({
        message: 'Eatery created successfully',
        eatery: {
          id: this.lastID,
          name, address, type, cuisine, rating, price, comment, dietaryOptions, images
        }
      });
    });
  } catch (error) {
    console.error('Create eatery error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update an existing eatery
router.put('/:id', authenticateToken, [
  body('name').optional().notEmpty().trim().escape(),
  body('address').optional().notEmpty().trim().escape(),
  body('type').optional().notEmpty().trim().escape(),
  body('cuisine').optional().trim().escape(),
  body('rating').optional().isInt({ min: 0, max: 5 }),
  body('price').optional().trim().escape(),
  body('comment').optional().trim().escape(),
  body('dietaryOptions').optional().isObject(),
  body('images').optional().isArray()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const userId = req.user.userId;
    const updateData = req.body;

    // Check if eatery exists and belongs to user
    db.get('SELECT id FROM eateries WHERE id = ? AND user_id = ?', [id, userId], (err, eatery) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!eatery) {
        return res.status(404).json({ error: 'Eatery not found' });
      }

      // Build update query dynamically
      const updateFields = [];
      const updateParams = [];

      if (updateData.name !== undefined) {
        updateFields.push('name = ?');
        updateParams.push(updateData.name);
      }
      if (updateData.address !== undefined) {
        updateFields.push('address = ?');
        updateParams.push(updateData.address);
      }
      if (updateData.type !== undefined) {
        updateFields.push('type = ?');
        updateParams.push(updateData.type);
      }
      if (updateData.cuisine !== undefined) {
        updateFields.push('cuisine = ?');
        updateParams.push(updateData.cuisine);
      }
      if (updateData.rating !== undefined) {
        updateFields.push('rating = ?');
        updateParams.push(updateData.rating);
      }
      if (updateData.price !== undefined) {
        updateFields.push('price = ?');
        updateParams.push(updateData.price);
      }
      if (updateData.comment !== undefined) {
        updateFields.push('comment = ?');
        updateParams.push(updateData.comment);
      }
      if (updateData.dietaryOptions !== undefined) {
        updateFields.push('dietary_options = ?');
        updateParams.push(JSON.stringify(updateData.dietaryOptions));
      }
      if (updateData.images !== undefined) {
        updateFields.push('images = ?');
        updateParams.push(JSON.stringify(updateData.images));
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateParams.push(id);

      const updateQuery = `UPDATE eateries SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`;
      updateParams.push(userId);

      db.run(updateQuery, updateParams, function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to update eatery' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: 'Eatery not found or no changes made' });
        }

        res.json({ message: 'Eatery updated successfully' });
      });
    });
  } catch (error) {
    console.error('Update eatery error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete an eatery
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  db.run('DELETE FROM eateries WHERE id = ? AND user_id = ?', [id, userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete eatery' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Eatery not found' });
    }

    res.json({ message: 'Eatery deleted successfully' });
  });
});

// Get public eateries (for map view)
router.get('/public/map', optionalAuth, (req, res) => {
  const { lat, lng, radius = 10 } = req.query;
  const userId = req.user?.userId;

  let query = `
    SELECT e.*, u.username as owner_name
    FROM eateries e
    JOIN users u ON e.user_id = u.id
  `;

  if (lat && lng) {
    // Add distance calculation if coordinates provided
    query += ` ORDER BY e.created_at DESC LIMIT 100`;
  } else {
    query += ` ORDER BY e.created_at DESC LIMIT 50`;
  }

  db.all(query, [], (err, eateries) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Parse JSON fields and filter by user if authenticated
    const parsedEateries = eateries
      .map(eatery => ({
        ...eatery,
        dietaryOptions: eatery.dietary_options ? JSON.parse(eatery.dietary_options) : {},
        images: eatery.images ? JSON.parse(eatery.images) : [],
        isOwner: userId === eatery.user_id
      }))
      .filter(eatery => !userId || eatery.isOwner || eatery.rating >= 3); // Show own eateries or highly rated ones

    res.json({ eateries: parsedEateries });
  });
});

module.exports = router;
