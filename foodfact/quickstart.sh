#!/usr/bin/env bash

# Quick start script for FoodFact with Airflow

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 FoodFact - Quick Start with Airflow"
echo "======================================"
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker."
    exit 1
fi

if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose not found. Please install Docker Compose."
    exit 1
fi

echo "✓ Docker and Docker Compose are installed"
echo ""

# Start services
echo "🐳 Starting Docker services..."
docker compose up -d

echo ""
echo "⏳ Waiting for services to be ready (60 seconds)..."
for i in {60..1}; do
    echo -ne "   Remaining: $i seconds\r"
    sleep 1
done

echo ""
echo "✅ Services are running!"
echo ""
echo "📊 Available services:"
echo ""
echo "   Airflow UI:        http://localhost:8080"
echo "   Backend API:       http://localhost:8090/health"
echo "   PostgreSQL:        localhost:5433"
echo ""
echo "👤 Airflow credentials:"
echo "   Username: admin"
echo "   Password: admin"
echo ""
echo "📝 Frontend:"
echo "   cd frontend_react"
echo "   npm install"
echo "   NEXT_PUBLIC_API_URL=http://localhost:8090 npm run dev"
echo "   Then open: http://localhost:3000"
echo ""
echo "📚 Documentation:"
echo "   - Airflow:  ./airflow/README.md"
echo "   - Backend:  ./backend_scala/README.md"
echo "   - Frontend: ./frontend_react/README.md"
echo ""
echo "🛑 To stop all services:"
echo "   docker compose down"
echo ""
