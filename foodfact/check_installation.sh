#!/bin/bash

# Check FoodFact + Airflow installation
echo "🔍 Checking FoodFact + Airflow installation..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        return 0
    else
        echo -e "${RED}✗${NC} $1 (missing)"
        return 1
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1/"
        return 0
    else
        echo -e "${RED}✗${NC} $1/ (missing)"
        return 1
    fi
}

echo "📁 Checking structure..."
check_dir "airflow/dags"
check_dir "airflow/plugins"
check_dir "airflow/logs"
check_file "airflow/requirements.txt"
check_file "airflow/README.md"

echo ""
echo "📄 Checking documentation..."
check_file "AIRFLOW_ORCHESTRATION.md"
check_file "AIRFLOW_INTEGRATION.md"
check_file "AIRFLOW_SUMMARY.md"
check_file "docker-compose.yml"

echo ""
echo "🔧 Checking Python files..."
check_file "airflow/dags/foodfact_orchestration.py"
check_file "airflow/dags/cache_maintenance.py"
check_file "airflow/plugins/foodfact_operators.py"

echo ""
echo "📝 Checking Docker..."
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓${NC} Docker is installed"
else
    echo -e "${RED}✗${NC} Docker not found"
fi

if command -v docker compose &> /dev/null; then
    echo -e "${GREEN}✓${NC} Docker Compose is installed"
else
    echo -e "${RED}✗${NC} Docker Compose not found"
fi

echo ""
echo "✅ Installation check complete!"
echo ""
echo "📊 Next steps:"
echo "1. docker compose up -d"
echo "2. Wait 30 seconds for services to start"
echo "3. Visit http://localhost:8080 (admin/admin)"
