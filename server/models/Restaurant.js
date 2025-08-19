const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  contact: {
    phone: String,
    website: String,
    email: String
  },
  cuisine: {
    type: String,
    required: true,
    trim: true
  },
  dietaryOptions: [{
    type: String,
    enum: [
      'vegetarian',
      'vegan',
      'gluten-free',
      'dairy-free',
      'nut-free',
      'halal',
      'kosher',
      'organic',
      'farm-to-table',
      'sustainable'
    ]
  }],
  priceRange: {
    type: String,
    enum: ['budget', 'moderate', 'expensive', 'luxury'],
    default: 'moderate'
  },
  rating: {
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  hours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  features: [{
    type: String,
    enum: [
      'delivery',
      'takeout',
      'dine-in',
      'outdoor-seating',
      'wheelchair-accessible',
      'parking',
      'reservations',
      'live-music',
      'bar',
      'wine-list'
    ]
  }],
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  addedViaSlack: {
    type: Boolean,
    default: false
  },
  slackChannel: String,
  slackMessageId: String,
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [String],
  notes: String,
  photos: [String]
}, {
  timestamps: true
});

// Indexes for efficient queries
restaurantSchema.index({ name: 1, 'address.city': 1 });
restaurantSchema.index({ dietaryOptions: 1 });
restaurantSchema.index({ cuisine: 1 });
restaurantSchema.index({ priceRange: 1 });
restaurantSchema.index({ 'address.coordinates': '2dsphere' });
restaurantSchema.index({ addedBy: 1 });
restaurantSchema.index({ isActive: 1 });

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;
