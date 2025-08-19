# SentrEats Backend

A Node.js/Express backend API for the SentrEats application with user authentication and eatery management.

## Features

- **User Authentication**: JWT-based login/registration system
- **User Profiles**: Editable user profiles with avatars and bios
- **Eatery Management**: CRUD operations for user eateries
- **SQLite Database**: Lightweight database with automatic table creation
- **Input Validation**: Express-validator for request validation
- **Security**: Password hashing with bcrypt, JWT tokens

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   PORT=9000
   NODE_ENV=development
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Start Production Server**
   ```bash
   npm start
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - User logout

### Users

- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Change password
- `DELETE /api/users/account` - Delete user account
- `GET /api/users/stats` - Get user statistics

### Eateries

- `GET /api/eateries` - Get user's eateries
- `GET /api/eateries/:id` - Get specific eatery
- `POST /api/eateries` - Create new eatery
- `PUT /api/eateries/:id` - Update eatery
- `DELETE /api/eateries/:id` - Delete eatery
- `GET /api/eateries/public/map` - Get public eateries for map

## Database Schema

### Users Table
- `id` - Primary key
- `username` - Unique username
- `email` - Unique email
- `password_hash` - Hashed password
- `avatar` - Profile picture URL
- `bio` - User biography
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

### Eateries Table
- `id` - Primary key
- `user_id` - Foreign key to users table
- `name` - Eatery name
- `address` - Eatery address
- `type` - Eatery type (restaurant, cafe, etc.)
- `cuisine` - Cuisine type
- `rating` - User rating (0-5)
- `price` - Price range
- `comment` - User notes
- `images` - JSON array of image URLs
- `dietary_options` - JSON object of dietary preferences
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## Security Features

- **Password Hashing**: Bcrypt with 12 salt rounds
- **JWT Tokens**: 7-day expiration
- **Input Validation**: Sanitization and validation
- **SQL Injection Protection**: Parameterized queries
- **CORS**: Cross-origin resource sharing enabled

## Development

- **Hot Reload**: Nodemon for development
- **Error Handling**: Comprehensive error middleware
- **Logging**: Console logging for debugging
- **Database**: Automatic table creation and indexing

## Production Considerations

- Use environment variables for sensitive data
- Change JWT secret in production
- Consider using PostgreSQL/MySQL for larger scale
- Implement rate limiting
- Add HTTPS in production
- Set up proper logging
