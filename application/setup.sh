#!/bin/bash

echo "🎫 Setting up TicketNow MERN Stack Application..."

# Create backend .env file if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend .env file..."
    cp backend/env.example backend/.env
    echo "✅ Backend .env file created. Please edit it with your actual values."
fi

# Create frontend .env.local file if it doesn't exist
if [ ! -f "frontend/.env.local" ]; then
    echo "📝 Creating frontend .env.local file..."
    cp frontend/env.example frontend/.env.local
    echo "✅ Frontend .env.local file created. Please edit it with your actual values."
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "🐳 Starting Docker services..."
docker-compose up -d

echo "⏳ Waiting for services to start..."
sleep 10

echo "✅ Setup complete!"
echo ""
echo "🚀 Services available:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:3001"
echo "   - API Docs: http://localhost:3001/api/docs"
echo "   - MongoDB Admin: http://localhost:8081 (admin/admin123)"
echo "   - Redis Admin: http://localhost:8082"
echo ""
echo "📝 Next steps:"
echo "   1. Edit backend/.env with your actual API keys"
echo "   2. Edit frontend/.env.local with your actual values"
echo "   3. Check logs: docker-compose logs backend"
echo "   4. Check frontend logs: docker-compose logs frontend"
echo "   5. Start developing!"
