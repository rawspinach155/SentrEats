const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  slackId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  slackUsername: {
    type: String,
    required: true
  },
  slackTeamId: {
    type: String,
    required: true
  },
  slackTeamName: String,
  email: String,
  profile: {
    firstName: String,
    lastName: String,
    displayName: String,
    image: String
  },
  preferences: {
    dietaryRestrictions: [String],
    favoriteCuisines: [String],
    priceRange: {
      type: String,
      enum: ['budget', 'moderate', 'expensive', 'luxury']
    },
    location: {
      city: String,
      state: String,
      country: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    }
  },
  accessToken: String,
  refreshToken: String,
  tokenExpiresAt: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
userSchema.index({ slackId: 1, slackTeamId: 1 });
userSchema.index({ 'preferences.dietaryRestrictions': 1 });
userSchema.index({ 'preferences.location.city': 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
