#!/bin/bash

echo "🧪 Testing INCOIS Hazard Reporting System"
echo "========================================"

# Test backend health
echo "1. Testing backend health..."
HEALTH=$(curl -s http://localhost:3001/api/health)
if [[ $? -eq 0 ]]; then
    echo "✅ Backend is running"
    echo "   Response: $HEALTH"
else
    echo "❌ Backend not responding on port 3001"
    echo "   Make sure to run: cd backend && npm run dev"
    exit 1
fi

# Test frontend
echo ""
echo "2. Testing frontend..."
FRONTEND=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [[ $FRONTEND -eq 200 ]]; then
    echo "✅ Frontend is running on http://localhost:3000"
else
    echo "❌ Frontend not responding on port 3000"
    echo "   Make sure to run: npm run dev"
fi

echo ""
echo "🎉 System Status:"
echo "   🔧 Backend API: http://localhost:3001/api"
echo "   🎨 Frontend App: http://localhost:3000"
echo "   📊 Dashboard: http://localhost:3001/api/dashboard/stats"
echo ""
echo "📚 Next steps:"
echo "   - Register a user via frontend or API"
echo "   - Submit test hazard reports"
echo "   - Check real-time updates via WebSocket"