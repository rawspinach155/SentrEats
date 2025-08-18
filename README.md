# SentrEats 🍽️
hihihi testin changes
A beautiful and intuitive food place management app for tracking restaurants with dietary options, ratings, and photos.

## Features

- **Restaurant Management**: Add, view, and delete food places
- **Comprehensive Details**: Name, address, cuisine type, price range
- **Dietary Options**: Track gluten-free, vegan, vegetarian, dairy-free, and nut-free options
- **Potato Rating System**: Rate places from 1-5 potatoes 🥔
- **Image Upload**: Add multiple photos for each location
- **Modern UI**: Beautiful, responsive design with smooth animations
- **Side Profile**: Easy-to-use form that slides in from the side

## Tech Stack

- **Frontend**: React 18 with modern hooks
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React for beautiful, consistent icons
- **Build Tool**: Vite for fast development and building
- **Language**: JavaScript (JSX)

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd SentrEats
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
npm run preview
```

## Usage

### Adding a New Food Place

1. Click the "Add New Place" button in the header
2. Fill out the form with:
   - Restaurant name
   - Full address
   - Dietary options (checkboxes for GF, vegan, vegetarian, etc.)
   - Price range ($ to $$$$)
   - Cuisine type (dropdown with 17+ options)
   - Rating (1-5 potatoes)
   - Images (drag & drop or click to upload)
3. Click "Add Food Place" to save

### Managing Your Places

- View all added places in the main content area
- Delete places using the trash icon
- See dietary badges, ratings, and photos for each location
- Responsive design works on all device sizes

## Project Structure

```
src/
├── components/
│   ├── Header.jsx          # App header with title and add button
│   ├── FoodPlaceForm.jsx   # Side profile form for adding places
│   └── FoodPlaceList.jsx   # Display list of all food places
├── App.jsx                 # Main app component
├── main.jsx               # React entry point
└── index.css              # Global styles and Tailwind imports
```

## Customization

### Colors
The app uses a custom color palette defined in `tailwind.config.js`:
- Primary: Warm orange tones
- Secondary: Blue tones
- Custom animations for smooth interactions

### Adding New Features
- Dietary options can be easily extended in the `FoodPlaceForm.jsx`
- Cuisine types can be modified in the cuisine options array
- Rating system can be changed from potatoes to stars or other icons

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

---

Built with ❤️ and 🥔 for food lovers everywhere!