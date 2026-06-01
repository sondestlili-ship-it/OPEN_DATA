#!/bin/bash

# FoodFact Airflow - Validation Script
# Vérifie que l'intégration Airflow est correctement faite

set -e

echo "✅ FoodFact Airflow Integration Validation"
echo "=========================================="
echo ""

PASSED=0
FAILED=0

# Test function
test_file() {
    if [ -f "$1" ]; then
        echo "✓ $1"
        ((PASSED++))
    else
        echo "✗ MISSING: $1"
        ((FAILED++))
    fi
}

test_dir() {
    if [ -d "$1" ]; then
        echo "✓ $1/"
        ((PASSED++))
    else
        echo "✗ MISSING: $1/"
        ((FAILED++))
    fi
}

test_contains() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo "✓ $1 contains '$2'"
        ((PASSED++))
    else
        echo "✗ $1 missing '$2'"
        ((FAILED++))
    fi
}

echo "📁 Checking directory structure..."
test_dir "airflow/dags"
test_dir "airflow/plugins"
test_dir "airflow/logs"
test_dir "airflow/config"

echo ""
echo "📄 Checking core files..."
test_file "airflow/dags/foodfact_orchestration.py"
test_file "airflow/dags/cache_maintenance.py"
test_file "airflow/plugins/foodfact_operators.py"
test_file "airflow/requirements.txt"
test_file "docker-compose.yml"

echo ""
echo "📚 Checking documentation..."
test_file "airflow/README.md"
test_file "AIRFLOW_ORCHESTRATION.md"
test_file "AIRFLOW_INTEGRATION.md"
test_file "AIRFLOW_SUMMARY.md"
test_file "PROJECT_STRUCTURE.md"

echo ""
echo "🔍 Checking docker-compose configuration..."
test_contains "docker-compose.yml" "postgres-airflow"
test_contains "docker-compose.yml" "airflow-scheduler"
test_contains "docker-compose.yml" "airflow-webserver"
test_contains "docker-compose.yml" "foodfact-network"

echo ""
echo "🔍 Checking DAG configuration..."
test_contains "airflow/dags/foodfact_orchestration.py" "foodfact_data_orchestration"
test_contains "airflow/dags/foodfact_orchestration.py" "schedule_interval"
test_contains "airflow/dags/cache_maintenance.py" "cache_maintenance"

echo ""
echo "🔍 Checking requirements.txt..."
test_contains "airflow/requirements.txt" "apache-airflow"
test_contains "airflow/requirements.txt" "requests"
test_contains "airflow/requirements.txt" "pandas"

echo ""
echo "=========================================="
echo "Results: ✓ $PASSED / ✗ $FAILED"
echo "=========================================="

if [ $FAILED -eq 0 ]; then
    echo "✅ All checks passed!"
    echo ""
    echo "Next steps:"
    echo "1. chmod +x quickstart.sh"
    echo "2. ./quickstart.sh"
    echo "3. Open http://localhost:8080 (admin/admin)"
    exit 0
else
    echo "❌ Some checks failed"
    exit 1
fi
