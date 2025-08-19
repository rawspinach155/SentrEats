import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './SubmitReview.css'

function SubmitReview() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    restaurantName: '',
    dishName: '',
    rating: 5,
    review: '',
    centaurName: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // In a real app, this would save to a database
    console.log('Review submitted:', formData)
    alert('Review submitted successfully!')
    navigate('/')
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="submit-review">
      <div className="container">
        <h1>Submit a Review</h1>
        <form onSubmit={handleSubmit} className="review-form">
          <div className="form-group">
            <label htmlFor="restaurantName">Restaurant Name</label>
            <input
              type="text"
              id="restaurantName"
              name="restaurantName"
              value={formData.restaurantName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="dishName">Dish Name</label>
            <input
              type="text"
              id="dishName"
              name="dishName"
              value={formData.dishName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="rating">Rating (1-5)</label>
            <select
              id="rating"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
            >
              <option value="5">5 - Excellent</option>
              <option value="4">4 - Very Good</option>
              <option value="3">3 - Good</option>
              <option value="2">2 - Fair</option>
              <option value="1">1 - Poor</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="centaurName">Your Centaur Name</label>
            <input
              type="text"
              id="centaurName"
              name="centaurName"
              value={formData.centaurName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="review">Review</label>
            <textarea
              id="review"
              name="review"
              value={formData.review}
              onChange={handleChange}
              rows="5"
              required
              placeholder="Share your thoughts about the food..."
            />
          </div>

          <button type="submit" className="submit-btn">
            Submit Review
          </button>
        </form>
      </div>
    </div>
  )
}

export default SubmitReview

