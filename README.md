# SentrEats

An eatery management app for tracking restaurants with dietary options.

## Features

- **Sticky Navigation Bar**: Always visible navigation with Home and Map tabs
- **Eatery Management**: Add, view, and delete eateries
- **Interactive Map**: Google Maps integration for viewing eateries geographically
- **User Profile**: Editable profile with avatar, name, email, and bio
- **Responsive Design**: Modern UI built with Tailwind CSS

## New Features

### Sticky Navigation
- **Home Tab**: View and manage your eateries list
- **Map Tab**: Interactive Google Maps view of eateries
- **Profile Button**: Click to view and edit your profile

### Google Maps Integration
- Uses Google Maps API with Places library
- Default location: New York City
- Interactive map with zoom and pan controls
- Error handling and loading states

### Profile Management
- Editable profile information
- Avatar support
- Settings and logout options
- Responsive form controls

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up Google Maps API key (see below)
4. Start development server: `npm run dev`
5. Open your browser to the local development URL

### Google Maps API Setup

To use the interactive map feature, you'll need a Google Maps API key:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select an existing one
3. Enable the Maps JavaScript API
4. Create credentials (API key)
5. Create a `.env` file in the root directory with:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```
6. Restrict the API key to your domain for security

## Dependencies

- React 18
- Vite
- Tailwind CSS
- Lucide React (for icons)
- Google Maps API

## API Key

The app uses a Google Maps API key for map functionality. Follow the setup instructions above to configure your own API key.

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build