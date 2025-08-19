import React from 'react'
import { useParams, Link } from 'react-router-dom'
import './ReviewDetail.css'

function ReviewDetail() {
  const { id } = useParams()

  // Mock data - in a real app this would come from an API
  const mockReview = {
    id: id,
    restaurantName: "The Centaur's Feast",
    dishName: "Grilled Venison Steak",
    rating: 5,
    review: "Absolutely divine! The venison was perfectly cooked to medium-rare, tender and flavorful. The accompanying wild mushroom sauce was a perfect complement. As a centaur, I appreciate restaurants that understand our dietary preferences. Highly recommended!",
    centaurName: "Thunderhoof",
    date: "2024-01-15"
  }

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating)
  }

  return (
    <div className="review-detail">
      <div className="container">
        <Link to="/" className="back-link">← Back to Reviews</Link>
        
        <div className="review-card">
          <div className="review-header">
            <h1>{mockReview.dishName}</h1>
            <p className="restaurant-name">at {mockReview.restaurantName}</p>
            <div className="rating">
              <span className="stars">{renderStars(mockReview.rating)}</span>
              <span className="rating-text">({mockReview.rating}/5)</span>
            </div>
          </div>

          <div className="review-content">
            <p className="review-text">{mockReview.review}</p>
          </div>

          <div className="review-footer">
            <p className="reviewer">Reviewed by <strong>{mockReview.centaurName}</strong></p>
            <p className="date">{new Date(mockReview.date).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="actions">
          <Link to="/submit" className="btn btn-primary">
            Submit Your Own Review
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ReviewDetail

