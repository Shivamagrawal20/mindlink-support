#!/bin/bash
# Script to start the backend server

echo "🚀 Starting MindLink AI Backend Server..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env file from .env.example"
    exit 1
fi

# Check if MongoDB URI is set
if ! grep -q "MONGODB_URI=" .env || grep -q "MONGODB_URI=mongodb://localhost" .env && ! grep -q "mongodb+srv" .env; then
    echo "⚠️  Warning: Check your MONGODB_URI in .env file"
fi

# Check if JWT_SECRET is still placeholder
if grep -q "JWT_SECRET=your-super-secret" .env; then
    echo "⚠️  Warning: JWT_SECRET is still using placeholder value!"
    echo "   Please update it in .env file for security"
fi

echo "✅ Starting server..."
echo ""

npm run dev

