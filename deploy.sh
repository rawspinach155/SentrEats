#!/bin/bash

echo "🚀 Deploying SentrEats..."

# Build the project
echo "📦 Building project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "🌐 Your app is ready for deployment!"
    echo ""
    echo "Deployment options:"
    echo "1. Vercel: vercel"
    echo "2. Netlify: Upload the 'dist' folder"
    echo "3. GitHub Pages: npm run deploy"
    echo ""
    echo "The built files are in the 'dist' directory"
else
    echo "❌ Build failed!"
    exit 1
fi


