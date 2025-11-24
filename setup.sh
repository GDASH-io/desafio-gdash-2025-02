#!/bin/bash

# ========================================
# GDASH Weather Platform - Setup Script
# ========================================

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║     GDASH Weather Platform - Initial Setup               ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check if .env exists
if [ -f ".env" ]; then
    echo "⚠️  File .env already exists!"
    read -p "Do you want to overwrite it? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled."
        exit 1
    fi
fi

# Copy .env.example to .env
echo "📋 Creating .env file..."
cp .env.example .env

echo ""
echo "✅ File .env created successfully!"
echo ""
echo "⚠️  IMPORTANT: You need to configure your Groq API Key!"
echo ""
echo "1. Get a free API key at: https://console.groq.com/keys"
echo "2. Open the .env file"
echo "3. Replace GROQ_API_KEY= with your key"
echo ""
echo "📝 Example: GROQ_API_KEY=gsk_your_key_here"
echo ""
read -p "Press Enter after configuring the GROQ_API_KEY..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo ""
    echo "❌ Docker is not running!"
    echo "Please start Docker Desktop and run this script again."
    exit 1
fi

echo ""
echo "🐳 Docker is running!"
echo ""
echo "🚀 Starting all services..."
echo ""

# Start services
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check services status
echo ""
echo "📊 Services Status:"
echo ""
docker-compose ps

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║              ✅ Setup completed successfully!             ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "🌐 Access the application:"
echo ""
echo "   Frontend:  http://localhost:5173"
echo "   API:       http://localhost:4000/api"
echo "   RabbitMQ:  http://localhost:15672"
echo "              (user: gdash, password: gdash123)"
echo ""
echo "🔐 Default login credentials:"
echo ""
echo "   Email:    admin@example.com"
echo "   Password: 123456"
echo ""
echo "📝 View logs:"
echo "   docker-compose logs -f [service-name]"
echo ""
echo "🛑 Stop all services:"
echo "   docker-compose down"
echo ""
