const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Get all reviews
router.get('/', (req, res) => {
  try {
    const reviewsPath = path.join(__dirname, '../../data/reviews.json');
    
    // Check if file exists
    if (!fs.existsSync(reviewsPath)) {
      return res.status(404).json({ error: 'Reviews data file not found' });
    }
    
    // Read and parse the JSON file
    const reviewsData = fs.readFileSync(reviewsPath, 'utf8');
    const reviews = JSON.parse(reviewsData);
    
    // Sort reviews by creation date (newest first)
    const sortedReviews = reviews.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt)
    });
    
    res.json({
      success: true,
      count: sortedReviews.length,
      reviews: sortedReviews
    });
    
  } catch (error) {
    console.error('Error reading reviews:', error);
    res.status(500).json({ 
      error: 'Failed to read reviews data',
      message: error.message 
    });
  }
});

// Get reviews by user ID
router.get('/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const reviewsPath = path.join(__dirname, '../../data/reviews.json');
    
    // Check if file exists
    if (!fs.existsSync(reviewsPath)) {
      return res.status(404).json({ error: 'Reviews data file not found' });
    }
    
    // Read and parse the JSON file
    const reviewsData = fs.readFileSync(reviewsPath, 'utf8');
    const reviews = JSON.parse(reviewsData);
    
    // Filter reviews by user ID
    const userReviews = reviews.filter(review => review.userId === parseInt(userId));
    
    // Sort reviews by creation date (newest first)
    const sortedReviews = userReviews.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt)
    });
    
    res.json({
      success: true,
      count: sortedReviews.length,
      reviews: sortedReviews
    });
    
  } catch (error) {
    console.error('Error reading user reviews:', error);
    res.status(500).json({ 
      error: 'Failed to read user reviews data',
      message: error.message 
    });
  }
});

// Get reviews by eatery ID
router.get('/eatery/:eateryId', (req, res) => {
  try {
    const { eateryId } = req.params;
    const reviewsPath = path.join(__dirname, '../../data/reviews.json');
    
    // Check if file exists
    if (!fs.existsSync(reviewsPath)) {
      return res.status(404).json({ error: 'Reviews data file not found' });
    }
    
    // Read and parse the JSON file
    const reviewsData = fs.readFileSync(reviewsPath, 'utf8');
    const reviews = JSON.parse(reviewsData);
    
    // Filter reviews by eatery ID
    const eateryReviews = reviews.filter(review => review.eateryId === parseInt(eateryId));
    
    // Sort reviews by creation date (newest first)
    const sortedReviews = eateryReviews.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt)
    });
    
    res.json({
      success: true,
      count: sortedReviews.length,
      reviews: sortedReviews
    });
    
  } catch (error) {
    console.error('Error reading eatery reviews:', error);
    res.status(500).json({ 
      error: 'Failed to read eatery reviews data',
      message: error.message 
    });
  }
});

// Create a new review
router.post('/', (req, res) => {
  try {
    const reviewsPath = path.join(__dirname, '../../data/reviews.json');
    
    // Read existing reviews
    const reviewsData = fs.readFileSync(reviewsPath, 'utf8');
    const reviews = JSON.parse(reviewsData);
    
    // Generate new review ID
    const newId = Math.max(...reviews.map(r => r.id), 0) + 1;
    
    // Create new review object
    const newReview = {
      id: newId,
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add to reviews array
    reviews.push(newReview);
    
    // Write back to file
    fs.writeFileSync(reviewsPath, JSON.stringify(reviews, null, 2));
    
    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      review: newReview
    });
    
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ 
      error: 'Failed to create review',
      message: error.message 
    });
  }
});

// Update a review
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const reviewsPath = path.join(__dirname, '../../data/reviews.json');
    
    // Read existing reviews
    const reviewsData = fs.readFileSync(reviewsPath, 'utf8');
    const reviews = JSON.parse(reviewsData);
    
    // Find the review to update
    const reviewIndex = reviews.findIndex(review => review.id === parseInt(id));
    
    if (reviewIndex === -1) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    // Update the review
    reviews[reviewIndex] = {
      ...reviews[reviewIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    // Write back to file
    fs.writeFileSync(reviewsPath, JSON.stringify(reviews, null, 2));
    
    res.json({
      success: true,
      message: 'Review updated successfully',
      review: reviews[reviewIndex]
    });
    
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ 
      error: 'Failed to update review',
      message: error.message 
    });
  }
});

// Delete a review
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const reviewsPath = path.join(__dirname, '../../data/reviews.json');
    
    // Read existing reviews
    const reviewsData = fs.readFileSync(reviewsPath, 'utf8');
    const reviews = JSON.parse(reviewsData);
    
    // Find the review to delete
    const reviewIndex = reviews.findIndex(review => review.id === parseInt(id));
    
    if (reviewIndex === -1) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    // Remove the review
    const deletedReview = reviews.splice(reviewIndex, 1)[0];
    
    // Write back to file
    fs.writeFileSync(reviewsPath, JSON.stringify(reviews, null, 2));
    
    res.json({
      success: true,
      message: 'Review deleted successfully',
      review: deletedReview
    });
    
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ 
      error: 'Failed to delete review',
      message: error.message 
    });
  }
});

module.exports = router;
