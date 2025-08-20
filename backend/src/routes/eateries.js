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

// Get eateries by user ID
router.get('/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const eateriesPath = path.join(__dirname, '../../data/eateries.json');
    
    // Check if file exists
    if (!fs.existsSync(eateriesPath)) {
      return res.status(404).json({ error: 'Eateries data file not found' });
    }
    
    // Read and parse the JSON file
    const eateriesData = fs.readFileSync(eateriesPath, 'utf8');
    const eateries = JSON.parse(eateriesData);
    
    // Filter eateries by user ID
    const userEateries = eateries.filter(eatery => eatery.userId === parseInt(userId));
    
    // Sort eateries by creation date (newest first)
    const sortedEateries = userEateries.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt)
    });
    
    res.json({
      success: true,
      count: sortedEateries.length,
      eateries: sortedEateries
    });
    
  } catch (error) {
    console.error('Error reading user eateries:', error);
    res.status(500).json({ 
      error: 'Failed to read user eateries data',
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
  body('rating').isInt({ min: 0, max: 5 }).withMessage('Rating must be a number between 0 and 5'),
  body('price').notEmpty().trim().escape(),
  body('comment').optional().trim().escape(),
  body('dietaryOptions').isObject().withMessage('Dietary options must be an object'),
  body('images').optional().isArray(),
  body('userId').notEmpty().isInt().withMessage('User ID must be a valid number')
], (req, res) => {
  try {
    console.log('Received eatery creation request:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      const errorMessages = errors.array().map(err => `${err.path}: ${err.msg}`).join(', ');
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errorMessages,
        errors: errors.array() 
      });
    }

    const {
      name, address, type, cuisine, rating, price, comment = '', dietaryOptions, images = [], userId
    } = req.body;
    
    console.log('Parsed request body:', { name, address, type, cuisine, rating, price, comment, dietaryOptions, images, userId })
    
    const eateriesPath = path.join(__dirname, '../../data/eateries.json');
    const usersPath = path.join(__dirname, '../../data/users.json');
    
    console.log('Eateries file path:', eateriesPath);
    console.log('Users file path:', usersPath);
    
    // Check if files exist
    if (!fs.existsSync(eateriesPath)) {
      console.error('Eateries file not found at:', eateriesPath);
      return res.status(500).json({ error: 'Eateries data file not found' });
    }
    
    if (!fs.existsSync(usersPath)) {
      console.error('Users file not found at:', usersPath);
      return res.status(500).json({ error: 'Users data file not found' });
    }
    
    // Read existing eateries and users
    const eateriesData = fs.readFileSync(eateriesPath, 'utf8');
    const usersData = fs.readFileSync(usersPath, 'utf8');
    const eateries = JSON.parse(eateriesData);
    const users = JSON.parse(usersData);
    
    // Find the user to get their name
    const user = users.find(u => u.id === parseInt(userId));
    if (!user) {
      console.error('User not found for ID:', userId);
      return res.status(400).json({ 
        error: 'User not found',
        details: `No user found with ID ${userId}`,
        userId: userId
      });
    }
    
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
      createdBy: user.email,
      userId: parseInt(userId)
    };
    
    // Add new eatery to array
    eateries.push(newEatery);
    
    console.log('New eatery created:', newEatery);
    console.log('Total eateries after creation:', eateries.length);
    
    // Write back to file
    try {
      fs.writeFileSync(eateriesPath, JSON.stringify(eateries, null, 2), 'utf8');
      console.log('Eateries file updated successfully');
      
      res.status(201).json({
        success: true,
        message: 'Eatery created successfully',
        eatery: newEatery
      });
    } catch (writeError) {
      console.error('Error writing to file:', writeError);
      res.status(500).json({ 
        error: 'Failed to save eatery to file',
        details: writeError.message
      });
    }
    
  } catch (error) {
    console.error('Create eatery error:', error);
    res.status(500).json({ 
      error: 'Failed to create eatery',
      message: error.message 
    });
  }
});

// Delete an eatery
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const eateriesPath = path.join(__dirname, '../../data/eateries.json');
    
    // Check if file exists
    if (!fs.existsSync(eateriesPath)) {
      return res.status(404).json({ error: 'Eateries data file not found' });
    }
    
    // Read existing eateries
    const eateriesData = fs.readFileSync(eateriesPath, 'utf8');
    const eateries = JSON.parse(eateriesData);
    
    // Find the eatery to delete
    const eateryIndex = eateries.findIndex(e => e.id === parseInt(id));
    
    if (eateryIndex === -1) {
      return res.status(404).json({ error: 'Eatery not found' });
    }
    
    // Remove the eatery from the array
    const deletedEatery = eateries.splice(eateryIndex, 1)[0];
    
    // Write back to file
    fs.writeFileSync(eateriesPath, JSON.stringify(eateries, null, 2), 'utf8');
    
    res.json({
      success: true,
      message: 'Eatery deleted successfully',
      deletedEatery
    });
    
  } catch (error) {
    console.error('Delete eatery error:', error);
    res.status(500).json({ 
      error: 'Failed to delete eatery',
      message: error.message 
    });
  }
});

module.exports = router;
