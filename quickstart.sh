#!/bin/bash

# TeamTrainer Quick Start Guide

echo "🏋️ TeamTrainer - Fitness Training Platform"
echo "=========================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Setup MongoDB
echo "🗄️  MongoDB Setup"
echo "   Option 1: Local MongoDB"
echo "   - Download from https://www.mongodb.com/try/download/community"
echo "   - Run: mongod"
echo ""
echo "   Option 2: MongoDB Atlas (Cloud)"
echo "   - Create account at https://www.mongodb.com/cloud/atlas"
echo "   - Copy connection string"
echo ""

# Check environment file
if [ ! -f ".env.local" ]; then
    echo "⚙️  Setting up environment variables..."
    cp .env.example .env.local
    echo "📝 Edit .env.local and add your MONGODB_URI"
    echo ""
fi

# Start development server
echo "🚀 Starting development server..."
echo "   Local:   http://localhost:3000"
echo "   Network: http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
