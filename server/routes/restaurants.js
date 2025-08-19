const express = require('express');
const jwt = require('jsonwebtoken');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get all restaurants (with optional filters)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { cuisine, city, dietaryOptions, priceRange, limit = 50, page = 1 } = req.query;
    
    let query = { isActive: true };
    
    if (cuisine) {
      query.cuisine = new RegExp(cuisine, 'i');
    }
    
    if (city) {
      query['address.city'] = new RegExp(city, 'i');
    }
    
    if (dietaryOptions) {
      const options = dietaryOptions.split(',').map(opt => opt.trim());
      query.dietaryOptions = { $in: options };
    }
    
    if (priceRange) {
      query.priceRange = priceRange;
    }
    
    const skip = (page - 1) * limit;
    
    const restaurants = await Restaurant.find(query)
      .populate('addedBy', 'slackUsername profile.displayName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Restaurant.countDocuments(query);
    
    res.json({
      restaurants,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});

// Get restaurant by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .populate('addedBy', 'slackUsername profile.displayName');
    
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch restaurant' });
  }
});

// Create new restaurant
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      address,
      contact,
      cuisine,
      dietaryOptions,
      priceRange,
      hours,
      features,
      tags,
      notes
    } = req.body;
    
    const restaurant = new Restaurant({
      name,
      address,
      contact,
      cuisine,
      dietaryOptions: dietaryOptions || [],
      priceRange: priceRange || 'moderate',
      hours,
      features: features || [],
      tags: tags || [],
      notes,
      addedBy: req.user._id,
      addedViaSlack: false
    });
    
    await restaurant.save();
    
    const populatedRestaurant = await Restaurant.findById(restaurant._id)
      .populate('addedBy', 'slackUsername profile.displayName');
    
    res.status(201).json(populatedRestaurant);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create restaurant' });
  }
});

// Update restaurant
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    // Check if user is the owner or has permission
    if (restaurant.addedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this restaurant' });
    }
    
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('addedBy', 'slackUsername profile.displayName');
    
    res.json(updatedRestaurant);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update restaurant' });
  }
});

// Delete restaurant
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    // Check if user is the owner or has permission
    if (restaurant.addedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this restaurant' });
    }
    
    // Soft delete - mark as inactive
    restaurant.isActive = false;
    await restaurant.save();
    
    res.json({ message: 'Restaurant deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete restaurant' });
  }
});

// Get user's restaurants
router.get('/user/me', authenticateToken, async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ 
      addedBy: req.user._id,
      isActive: true 
    }).sort({ createdAt: -1 });
    
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user restaurants' });
  }
});

module.exports = router;
