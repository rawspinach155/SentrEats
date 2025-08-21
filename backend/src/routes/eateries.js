const express = require('express');
const { body, validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Get all eateries with their reviews from JSON files
router.get('/', (req, res) => {
  try {
    const reviewsPath = path.join(__dirname, '../../data/reviews.json');
    const eateriesPath = path.join(__dirname, '../../data/eateries.json');
    
    // Check if files exist
    if (!fs.existsSync(reviewsPath)) {
      return res.status(404).json({ error: 'Reviews data file not found' });
    }
    
    if (!fs.existsSync(eateriesPath)) {
      return res.status(404).json({ error: 'Eateries data file not found' });
    }
    
    // Read and parse the JSON files
    const reviewsData = fs.readFileSync(reviewsPath, 'utf8');
    const eateriesData = fs.readFileSync(eateriesPath, 'utf8');
    const reviews = JSON.parse(reviewsData);
    const eateries = JSON.parse(eateriesData);
    
    // Attach reviews to each eatery
    const eateriesWithReviews = eateries.map(eatery => {
      const eateryReviews = reviews.filter(review => 
        eatery.reviewIds.includes(review.id)
      );
      
      return {
        ...eatery,
        reviews: eateryReviews
      };
    });
    
    // Sort eateries by creation date (newest first)
    const sortedEateries = eateriesWithReviews.sort((a, b) => {
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

// Get eateries with reviews by user ID
router.get('/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const reviewsPath = path.join(__dirname, '../../data/reviews.json');
    const eateriesPath = path.join(__dirname, '../../data/eateries.json');
    
    // Check if files exist
    if (!fs.existsSync(reviewsPath)) {
      return res.status(404).json({ error: 'Reviews data file not found' });
    }
    
    if (!fs.existsSync(eateriesPath)) {
      return res.status(404).json({ error: 'Eateries data file not found' });
    }
    
    // Read and parse the JSON files
    const reviewsData = fs.readFileSync(reviewsPath, 'utf8');
    const eateriesData = fs.readFileSync(eateriesPath, 'utf8');
    const reviews = JSON.parse(reviewsData);
    const eateries = JSON.parse(eateriesData);
    
    // Get user's reviews
    const userReviews = reviews.filter(review => review.userId === parseInt(userId));
    
    // Get eateries that have reviews from this user
    const userEateries = eateries.filter(eatery => 
      eatery.reviewIds.some(reviewId => 
        userReviews.some(review => review.id === reviewId)
      )
    );
    
    // Attach reviews to each eatery
    const eateriesWithReviews = userEateries.map(eatery => {
      const eateryReviews = reviews.filter(review => 
        eatery.reviewIds.includes(review.id)
      );
      
      return {
        ...eatery,
        reviews: eateryReviews
      };
    });
    
    // Sort eateries by creation date (newest first)
    const sortedEateries = eateriesWithReviews.sort((a, b) => {
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

// Create a new review and handle eatery creation/update
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
  body('userId').notEmpty().isInt().withMessage('User ID must be a valid number'),
  body('coordinates').optional().isObject().withMessage('Coordinates must be an object')
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
      name, address, type, cuisine, rating, price, comment = '', dietaryOptions, images = [], userId, coordinates
    } = req.body;
    
    console.log('Parsed request body:', { name, address, type, cuisine, rating, price, comment, dietaryOptions, images, userId, coordinates })
    
    const reviewsPath = path.join(__dirname, '../../data/reviews.json');
    const eateriesPath = path.join(__dirname, '../../data/eateries.json');
    const usersPath = path.join(__dirname, '../../data/users.json');
    
    console.log('Reviews file path:', reviewsPath);
    console.log('Eateries file path:', eateriesPath);
    console.log('Users file path:', usersPath);
    
    // Check if files exist
    if (!fs.existsSync(reviewsPath)) {
      console.error('Reviews file not found at:', reviewsPath);
      return res.status(500).json({ error: 'Reviews data file not found' });
    }
    
    if (!fs.existsSync(eateriesPath)) {
      console.error('Eateries file not found at:', eateriesPath);
      return res.status(500).json({ error: 'Eateries data file not found' });
    }
    
    if (!fs.existsSync(usersPath)) {
      console.error('Users file not found at:', usersPath);
      return res.status(500).json({ error: 'Users data file not found' });
    }
    
    // Read existing reviews, eateries, and users
    const reviewsData = fs.readFileSync(reviewsPath, 'utf8');
    const eateriesData = fs.readFileSync(eateriesPath, 'utf8');
    const usersData = fs.readFileSync(usersPath, 'utf8');
    const reviews = JSON.parse(reviewsData);
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
    
    // Create new review first
    const newReview = {
      id: reviews.length > 0 ? Math.max(...reviews.map(r => r.id)) + 1 : 1,
      name,
      address,
      type,
      dietaryOptions,
      price,
      cuisine,
      rating,
      comment,
      images,
      coordinates: coordinates || null,
      createdAt: new Date().toISOString(),
      createdBy: user.email,
      userId: parseInt(userId)
    };
    
    // Check if eatery with this address already exists
    const existingEatery = eateries.find(eatery => 
      eatery.address.toLowerCase().trim() === address.toLowerCase().trim()
    );
    
    let eateryToReturn;
    let eateryId;
    
    if (existingEatery) {
      // Update existing eatery
      existingEatery.reviewIds.push(newReview.id);
      existingEatery.updatedAt = new Date().toISOString();
      
      // Update eatery details if they're different (use the first review's data)
      if (!existingEatery.name || existingEatery.name === '') {
        existingEatery.name = name;
      }
      if (!existingEatery.type || existingEatery.type === '') {
        existingEatery.type = type;
      }
      if (!existingEatery.cuisine || existingEatery.cuisine === '') {
        existingEatery.cuisine = cuisine;
      }
      if (!existingEatery.price || existingEatery.price === '') {
        existingEatery.price = price;
      }
      if (!existingEatery.coordinates && coordinates) {
        existingEatery.coordinates = coordinates;
      }
      
      eateryToReturn = existingEatery;
      eateryId = existingEatery.id;
      newReview.eateryId = eateryId; // Add eatery ID to review
      console.log('Updated existing eatery:', existingEatery.name, 'with review ID:', newReview.id);
    } else {
      // Create new eatery
      const newEatery = {
        id: eateries.length > 0 ? Math.max(...eateries.map(e => e.id)) + 1 : 1,
        name,
        address,
        coordinates: coordinates || null,
        type,
        cuisine,
        price,
        reviewIds: [newReview.id],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      eateries.push(newEatery);
      eateryToReturn = newEatery;
      eateryId = newEatery.id;
      newReview.eateryId = eateryId; // Add eatery ID to review
      console.log('Created new eatery:', newEatery.name, 'with review ID:', newReview.id);
    }
    
    // Add new review to array
    reviews.push(newReview);
    
    console.log('New review created:', newReview);
    console.log('Total reviews after creation:', reviews.length);
    console.log('Total eateries after creation:', eateries.length);
    
    // Write back to files
    try {
      fs.writeFileSync(reviewsPath, JSON.stringify(reviews, null, 2), 'utf8');
      fs.writeFileSync(eateriesPath, JSON.stringify(eateries, null, 2), 'utf8');
      console.log('Reviews and eateries files updated successfully');
      
      // Attach the new review to the eatery before returning
      const eateryWithReviews = {
        ...eateryToReturn,
        reviews: [newReview]
      };
      
      res.status(201).json({
        success: true,
        message: 'Review created successfully',
        eatery: eateryWithReviews
      });
    } catch (writeError) {
      console.error('Error writing to reviews or eateries file:', writeError);
      res.status(500).json({ 
        error: 'Failed to save review or eatery to file',
        details: writeError.message
      });
    }
    
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ 
      error: 'Failed to create review',
      message: error.message 
    });
  }
});

// Delete a review
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const reviewsPath = path.join(__dirname, '../../data/reviews.json');
    
    // Check if file exists
    if (!fs.existsSync(reviewsPath)) {
      return res.status(404).json({ error: 'Reviews data file not found' });
    }
    
    // Read existing reviews
    const reviewsData = fs.readFileSync(reviewsPath, 'utf8');
    const reviews = JSON.parse(reviewsData);
    
    // Find the review to delete
    const reviewIndex = reviews.findIndex(r => r.id === parseInt(id));
    
    if (reviewIndex === -1) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    // Remove the review from the array
    const deletedReview = reviews.splice(reviewIndex, 1)[0];
    
    // Write back to file
    fs.writeFileSync(reviewsPath, JSON.stringify(reviews, null, 2), 'utf8');
    
    res.json({
      success: true,
      message: 'Review deleted successfully',
      deletedEatery: deletedReview
    });
    
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ 
      error: 'Failed to delete review',
      message: error.message 
    });
  }
});

module.exports = router;
