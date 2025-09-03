#!/bin/bash

echo "🌊 Starting INCOIS Hazard Reporting System"
echo "=========================================="

# Check if backend .env exists
if [ ! -f "backend/.env" ]; then
    echo "❌ Backend .env file not found!"
    echo "📝 Please configure backend/.env with your Neon database URL"
    echo ""
    echo "1. cd backend"
    echo "2. cp .env.example .env"
    echo "3. Edit .env with your Neon connection string"
    echo "4. Run this script again"
    exit 1
fi

echo "✅ Environment configuration found"

# Check if backend dependencies are installed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

# Check if frontend dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install --legacy-peer-deps
fi

echo ""
echo "🗄️ Setting up database..."
echo "Make sure you have:"
echo "1. ✅ Neon database created"
echo "2. ✅ PostGIS extension enabled: CREATE EXTENSION IF NOT EXISTS postgis;"
echo "3. ✅ Connection string in backend/.env"
echo ""

read -p "Press Enter when database is ready, or Ctrl+C to exit..."

# Run migrations
echo "🔧 Running database migrations..."
cd backend && npm run migrate

# Ask about sample data
echo ""
read -p "🌱 Do you want to seed sample data? (y/N): " seed_choice
if [[ $seed_choice =~ ^[Yy]$ ]]; then
    npm run seed
    echo "✅ Sample data seeded"
fi

cd ..

echo ""
echo "🚀 Starting applications..."
echo ""
echo "🔧 Backend will start on: http://localhost:3001"
echo "🎨 Frontend will start on: http://localhost:3000"
echo ""
echo "📋 In separate terminals, run:"
echo "   Terminal 1: cd backend && npm run dev"
echo "   Terminal 2: npm run dev"
echo ""
echo "✅ Setup complete! Follow the instructions above to start both servers."