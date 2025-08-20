const express = require('express');
const { body, validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Get all eateries from JSON file
router.get('/', (req, res) => {
  try {
    const eateriesPath = path.join(__dirname, '../../data/eateries.json');
    
    // Check if file exists
    if (!fs.existsSync(eateriesPath)) {
      return res.status(404).json({ error: 'Eateries data file not found' });
    }
    
    // Read and parse the JSON file
    const eateriesData = fs.readFileSync(eateriesPath, 'utf8');
    const eateries = JSON.parse(eateriesData);
    
    // Sort eateries by creation date (newest first)
    const sortedEateries = eateries.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt)
    });
    
    res.json({
      success: true,
      count: sortedEateries.length,
      eateries: sortedEateries
    });
    
  } catch (error) {
    console.error('Error reading eateries:', error);
    res.status(500).json({ 
      error: 'Failed to read eateries data',
      message: error.message 
    });
  }
});

// Create a new eatery and add to JSON file
router.post('/', [
  body('name').notEmpty().trim().escape(),
  body('address').notEmpty().trim().escape(),
  body('type').notEmpty().trim().escape(),
  body('cuisine').notEmpty().trim().escape(),
  body('rating').isInt({ min: 0, max: 5 }),
  body('price').notEmpty().trim().escape(),
  body('comment').optional().trim().escape(),
  body('dietaryOptions').isObject(),
  body('images').optional().isArray()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name, address, type, cuisine, rating, price, comment = '', dietaryOptions, images = []
    } = req.body;
    
    const eateriesPath = path.join(__dirname, '../../data/eateries.json');
    
    // Check if file exists
    if (!fs.existsSync(eateriesPath)) {
      return res.status(500).json({ error: 'Eateries data file not found' });
    }
    
    // Read existing eateries
    const eateriesData = fs.readFileSync(eateriesPath, 'utf8');
    const eateries = JSON.parse(eateriesData);
    
    // Create new eatery
    const newEatery = {
      id: eateries.length > 0 ? Math.max(...eateries.map(e => e.id)) + 1 : 1,
      name,
      address,
      type,
      dietaryOptions,
      price,
      cuisine,
      rating,
      comment,
      images,
      createdAt: new Date().toISOString(),
      createdBy: 'current_user' // In a real app, this would come from auth
    };
    
    // Add new eatery to array
    eateries.push(newEatery);
    
    // Write back to file
    fs.writeFileSync(eateriesPath, JSON.stringify(eateries, null, 2), 'utf8');
    
    res.status(201).json({
      success: true,
      message: 'Eatery created successfully',
      eatery: newEatery
    });
    
  } catch (error) {
    console.error('Create eatery error:', error);
    res.status(500).json({ 
      error: 'Failed to create eatery',
      message: error.message 
    });
  }
});

module.exports = router;
