#!/bin/bash
# Initialize Airflow for FoodFact

set -e

echo "🚀 Initializing FoodFact Airflow..."

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p logs
mkdir -p config
mkdir -p dags
mkdir -p plugins

# Check if running in Docker
if [ -f /.dockerenv ]; then
    echo "🐳 Running inside Docker"
    
    # Upgrade database
    echo "🗄️  Upgrading Airflow database..."
    airflow db upgrade
    
    # Create admin user if it doesn't exist
    echo "👤 Creating admin user..."
    airflow users create \
        --username admin \
        --firstname Admin \
        --lastname User \
        --role Admin \
        --email admin@foodfact.local \
        --password admin || true
    
    # Create default connections
    echo "🔗 Creating default connections..."
    
    # Backend connection
    airflow connections add backend_default \
        --conn-type http \
        --conn-host backend \
        --conn-port 8080 || true
    
    # OpenFoodFacts connection
    airflow connections add openfoodfacts_default \
        --conn-type http \
        --conn-host world.openfoodfacts.org \
        --conn-port 443 || true
    
    echo "✅ Airflow initialization complete!"
    echo ""
    echo "📊 Airflow UI: http://localhost:8080"
    echo "👤 Username: admin"
    echo "🔑 Password: admin"
    echo ""
    echo "Available DAGs:"
    airflow dags list
    
else
    echo "💻 Running locally (not in Docker)"
    
    # Check Python version
    python_version=$(python3 --version 2>&1 | awk '{print $2}')
    echo "🐍 Python version: $python_version"
    
    # Initialize database
    echo "🗄️  Initializing Airflow database..."
    export AIRFLOW_HOME=$(pwd)
    airflow db upgrade
    
    # Create admin user
    echo "👤 Creating admin user..."
    airflow users create \
        --username admin \
        --firstname Admin \
        --lastname User \
        --role Admin \
        --email admin@foodfact.local \
        --password admin || true
    
    echo "✅ Airflow initialization complete!"
    echo ""
    echo "Start Airflow with:"
    echo "  1. airflow scheduler &"
    echo "  2. airflow webserver --port 8080"
    echo ""
    echo "📊 Airflow UI: http://localhost:8080"
    echo "👤 Username: admin"
    echo "🔑 Password: admin"
fi
