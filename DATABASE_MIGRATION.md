# Database Migration Guide

This guide shows how to migrate from localStorage to a database using the service layer pattern.

## Current Architecture

The app uses a service layer (`eateryService.js`) that abstracts all data operations. This makes migration seamless because:

- ✅ **Same interface** - All methods work the same way
- ✅ **Same error handling** - Try/catch patterns are identical
- ✅ **Same data structure** - JSON objects work with any database
- ✅ **Same async patterns** - All methods are already async

## Migration Steps

### Step 1: Choose Your Database

**Option A: SQLite (Simple)**
```bash
npm install sqlite3
```

**Option B: PostgreSQL (Production)**
```bash
npm install pg
```

**Option C: MongoDB (NoSQL)**
```bash
npm install mongodb
```

### Step 2: Create Database Service

Replace `src/services/eateryService.js` with your database implementation:

```javascript
// Example: PostgreSQL implementation
import { Pool } from 'pg'

class EateryServiceDatabase {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL
    })
  }

  async getAllEateries() {
    const result = await this.pool.query('SELECT * FROM eateries ORDER BY created_at DESC')
    return result.rows
  }

  async addEatery(eatery) {
    const result = await this.pool.query(
      'INSERT INTO eateries (name, cuisine, address, type, rating, dietary_options) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [eatery.name, eatery.cuisine, eatery.address, eatery.type, eatery.rating, JSON.stringify(eatery.dietaryOptions)]
    )
    return result.rows[0]
  }

  // ... other methods
}
```

### Step 3: Update App.jsx (Minimal Changes)

Only one line needs to change:

```javascript
// Before (localStorage)
import eateryService from './services/eateryService'

// After (database)
import eateryService from './services/eateryServiceDatabase'
```

**That's it!** All your components continue working exactly the same.

### Step 4: Environment Configuration

Add to your `.env` file:

```env
# For PostgreSQL
DATABASE_URL=postgresql://username:password@localhost:5432/sentre_eats

# For MongoDB
MONGODB_URI=mongodb://localhost:27017/sentre_eats

# For SQLite
DATABASE_PATH=./data/eateries.db
```

## Database Schema Examples

### PostgreSQL Schema

```sql
CREATE TABLE eateries (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  cuisine VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  dietary_options JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_eateries_cuisine ON eateries(cuisine);
CREATE INDEX idx_eateries_type ON eateries(type);
CREATE INDEX idx_eateries_rating ON eateries(rating);
```

### MongoDB Schema

```javascript
const eaterySchema = new mongoose.Schema({
  name: { type: String, required: true },
  cuisine: { type: String, required: true },
  address: { type: String, required: true },
  type: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5 },
  dietaryOptions: { type: Map, of: Boolean },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})
```

## Migration Benefits

### Performance Improvements
- **Faster queries** - Database indexes vs. array filtering
- **Pagination** - Load only what you need
- **Search optimization** - Full-text search capabilities

### Scalability
- **Multiple users** - Shared data across users
- **Real-time updates** - WebSocket integration
- **Backup & recovery** - Database backup systems

### Advanced Features
- **User authentication** - Link eateries to users
- **Collaboration** - Share eateries between users
- **Analytics** - Track popular eateries, ratings, etc.

## Testing the Migration

### 1. Data Migration Script

```javascript
// scripts/migrateData.js
import localStorageService from '../src/services/eateryService.js'
import databaseService from '../src/services/eateryServiceDatabase.js'

async function migrateData() {
  // Load from localStorage
  const eateries = await localStorageService.getAllEateries()
  
  // Save to database
  for (const eatery of eateries) {
    await databaseService.addEatery(eatery)
  }
  
  console.log(`Migrated ${eateries.length} eateries`)
}
```

### 2. Feature Parity Testing

```javascript
// tests/migration.test.js
describe('Database Migration', () => {
  test('should have same interface as localStorage', async () => {
    const localStorageService = new EateryService()
    const databaseService = new EateryServiceDatabase()
    
    // Test all methods work the same
    expect(typeof localStorageService.getAllEateries).toBe('function')
    expect(typeof databaseService.getAllEateries).toBe('function')
  })
})
```

## Rollback Plan

If you need to rollback to localStorage:

```javascript
// Just change the import back
import eateryService from './services/eateryService' // localStorage version
```

## Production Considerations

### 1. Connection Pooling
```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})
```

### 2. Error Handling
```javascript
async getAllEateries() {
  try {
    const result = await this.pool.query('SELECT * FROM eateries')
    return result.rows
  } catch (error) {
    console.error('Database error:', error)
    // Fallback to cached data or show user-friendly error
    return []
  }
}
```

### 3. Caching
```javascript
import NodeCache from 'node-cache'
const cache = new NodeCache({ stdTTL: 300 }) // 5 minutes

async getAllEateries() {
  const cached = cache.get('all-eateries')
  if (cached) return cached
  
  const result = await this.pool.query('SELECT * FROM eateries')
  cache.set('all-eateries', result.rows)
  return result.rows
}
```

## Conclusion

The service layer pattern makes database migration trivial:

1. **Same interface** - No component changes needed
2. **Same error handling** - Existing patterns work
3. **Same data flow** - React state management unchanged
4. **Easy testing** - Can test both implementations
5. **Simple rollback** - Just change the import

This architecture ensures your app is database-ready from day one! 🚀
