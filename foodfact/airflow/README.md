# 🚀 Airflow Integration - FoodFact Orchestration

## Vue d'ensemble

L'intégration Airflow dans FoodFact permet l'orchestration automatisée des tâches de gestion de données :

- **Collecte de données** : Fetch automatique de l'API OpenFoodFacts
- **Mise en cache** : Warm-up du cache backend avec recherches populaires
- **Contrôle de qualité** : Validation des données et des performances
- **Maintenance** : Nettoyage des caches expirés et optimisation
- **Monitoring** : Rapports d'exécution et alertes

## 📋 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Airflow Orchestration                     │
└─────────────────────────────────────────────────────────────┘
         │
         ├── 📊 Webserver (http://localhost:8080)
         │   └── Dashboard UI pour monitoring
         │
         ├── ⚙️  Scheduler
         │   └── Exécute les DAGs selon le calendrier
         │
         └── 🗄️  PostgreSQL
             └── Métadonnées Airflow

         ↓ ↓ ↓

┌─────────────────────────────────────────────────────────────┐
│                    Pipelines d'exécution                     │
├─────────────────────────────────────────────────────────────┤
│ 1. foodfact_data_orchestration (Quotidien, 02:00)          │
│    ├─ Health Check (Backend + OpenFoodFacts)               │
│    ├─ Fetch Popular Products (Collecte de données)         │
│    ├─ Warm-up Cache (Pré-chargement)                       │
│    ├─ Data Quality Check (Validation)                      │
│    └─ Generate Report (Rapport d'exécution)                │
│                                                             │
│ 2. cache_maintenance (Quotidien, 01:00)                    │
│    ├─ Clear Expired Cache                                  │
│    ├─ Analyze Cache Performance                            │
│    └─ Generate Maintenance Report                          │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Démarrage

### Option 1: Docker Compose (Recommandé)

```bash
cd /path/to/foodfact

# Démarrer tous les services
docker compose up -d

# Initialiser la base de données Airflow (première exécution)
docker compose exec airflow-webserver airflow db upgrade

# Créer l'utilisateur admin
docker compose exec airflow-webserver airflow users create \
  --username admin \
  --firstname Admin \
  --lastname User \
  --role Admin \
  --email admin@example.com \
  --password admin
```

### Option 2: Installation Locale

```bash
# Créer un environnement virtuel
python -m venv venv_airflow
source venv_airflow/bin/activate

# Installer les dépendances
cd airflow
pip install -r requirements.txt

# Initialiser Airflow
export AIRFLOW_HOME=$(pwd)
airflow db upgrade
airflow users create \
  --username admin \
  --firstname Admin \
  --lastname User \
  --role Admin \
  --email admin@example.com \
  --password admin

# Lancer le scheduler et le webserver
airflow scheduler &
airflow webserver --port 8080
```

## 📈 Accès à l'interface

- **URL** : http://localhost:8080
- **Username** : `admin`
- **Password** : `admin`

## 📊 DAGs Disponibles

### 1. foodfact_data_orchestration

**Exécution** : Quotidienne à 02:00 AM UTC

**Pipeline** :

```
Health Check
    ↓
Fetch Popular Products
    ↓
Warm-up Backend Cache
    ↓
Data Quality Check
    ↓
Generate Report
```

**Tasks** :

| Task | Description | Timeout |
|------|-------------|---------|
| `health_check` | Vérifie la disponibilité du backend et OpenFoodFacts | 30s |
| `fetch_popular_products` | Récupère les produits populaires | N/A |
| `warm_up_backend_cache` | Pré-charge le cache avec 10 recherches | N/A |
| `data_quality_check` | Valide le taux de succès (>80%) | N/A |
| `generate_pipeline_report` | Génère le rapport d'exécution | N/A |

**Variables XCom** :

```python
# Task: health_check
health_check_passed: bool

# Task: fetch_popular_products
fetched_data: {
    timestamp: str,
    total_products: int,
    searches_count: int,
    search_results: list
}

# Task: warm_up_backend_cache
cache_stats: {
    timestamp: str,
    warmed_up_searches: int,
    total_attempts: int,
    failures: list
}

# Task: data_quality_check
quality_report: {
    timestamp: str,
    success_rate: float,
    warmed_searches: int,
    total_attempts: int,
    status: 'PASSED' | 'WARNING'
}

# Task: generate_pipeline_report
pipeline_report: {
    execution_date: str,
    dag_id: str,
    run_id: str,
    status: str,
    health_check: bool,
    products_fetched: int,
    cache_warmed: int,
    quality_status: str
}
```

### 2. cache_maintenance

**Exécution** : Quotidienne à 01:00 AM UTC

**Pipeline** :

```
Clear Expired Cache
    ↓
Analyze Cache Performance
    ↓
Generate Maintenance Report
```

**Tasks** :

| Task | Description |
|------|-------------|
| `clear_expired_cache` | Nettoie les entrées de cache expirées |
| `analyze_cache_performance` | Analyse les métriques de cache |
| `generate_maintenance_report` | Génère le rapport de maintenance |

## 🔧 Configuration

### Variables d'environnement

```bash
# Airflow Core
AIRFLOW__CORE__EXECUTOR=LocalExecutor
AIRFLOW__DATABASE__SQL_ALCHEMY_CONN=postgresql+psycopg2://airflow:airflow@postgres-airflow:5432/airflow
AIRFLOW__CORE__DAGS_FOLDER=/opt/airflow/dags
AIRFLOW__CORE__BASE_LOG_FOLDER=/opt/airflow/logs

# Backend
BACKEND_URL=http://backend:8080
BACKEND_HEALTH_CHECK_URL=http://backend:8080/health

# OpenFoodFacts
OPENFOODFACTS_API_URL=https://world.openfoodfacts.org

# Logging
AIRFLOW__LOGGING__LOG_LEVEL=INFO
```

### Connexions Airflow

Pour ajouter des connexions personnalisées :

1. Accédez à Admin → Connections
2. Cliquez sur "Create"
3. Configures les détails :

**Exemple: Backend Connection**
```
Connection ID: backend_default
Connection Type: HTTP
Host: http://backend:8080
Port: 8080
```

## 📊 Monitoring et Logs

### Logs Docker

```bash
# Logs du Scheduler
docker compose logs -f airflow-scheduler

# Logs du Webserver
docker compose logs -f airflow-webserver

# Logs du Backend
docker compose logs -f backend

# Tous les logs
docker compose logs -f
```

### Accès aux logs via UI

1. Allez à DAGs → Sélectionnez un DAG
2. Cliquez sur Grid View ou Graph View
3. Cliquez sur une Task
4. Voir les logs dans l'onglet "Logs"

## 🛠️ Opérateurs Personnalisés

Trois opérateurs personnalisés sont disponibles dans `airflow/plugins/foodfact_operators.py` :

### 1. BackendHealthCheckOperator

Vérifie la santé du backend FoodFact

```python
from foodfact_operators import BackendHealthCheckOperator

health_check = BackendHealthCheckOperator(
    task_id='check_backend',
    backend_url='http://backend:8080',
    timeout=10,
    dag=dag
)
```

### 2. CacheWarmupOperator

Réchauffe le cache avec une liste de recherches

```python
from foodfact_operators import CacheWarmupOperator

warmup = CacheWarmupOperator(
    task_id='warmup_cache',
    backend_url='http://backend:8080',
    searches=['apple', 'bread', 'milk'],
    batch_size=5,
    dag=dag
)
```

### 3. DataQualityCheckOperator

Valide la qualité des données

```python
from foodfact_operators import DataQualityCheckOperator

quality = DataQualityCheckOperator(
    task_id='quality_check',
    backend_url='http://backend:8080',
    min_success_rate=80.0,
    dag=dag
)
```

## 🚨 Gestion des erreurs

### Retry Policy

Chaque task dispose de :
- **Retries** : 3 tentatives
- **Retry Delay** : 5 minutes

### SLA (Service Level Agreement)

Vous pouvez définir des SLA pour les DAGs :

```python
dag = DAG(
    'mon_dag',
    default_args=default_args,
    sla=timedelta(hours=1),  # Le DAG doit finir en 1h
)
```

### Alertes

Pour activer les alertes email :

```python
default_args = {
    'owner': 'foodfact-team',
    'email_on_failure': True,
    'email_on_retry': True,
    'email': ['admin@example.com'],
    'retries': 3,
}
```

## 📝 Créer vos propres DAGs

### Structure de base

```python
from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator

def my_task(**context):
    print("Hello from my task!")

default_args = {
    'owner': 'foodfact-team',
    'retries': 3,
    'retry_delay': timedelta(minutes=5),
    'start_date': datetime(2024, 1, 1),
}

dag = DAG(
    'my_custom_dag',
    default_args=default_args,
    description='My custom orchestration',
    schedule_interval='0 2 * * *',  # Daily at 2 AM
    catchup=False,
)

task = PythonOperator(
    task_id='my_task',
    python_callable=my_task,
    dag=dag,
)
```

Sauvegardez dans `airflow/dags/my_custom_dag.py` et Airflow le détectera automatiquement.

## 🧹 Nettoyage et arrêt

### Arrêter les services Docker

```bash
docker compose down

# Supprimer les volumes (données persistantes)
docker compose down -v
```

### Nettoyer les logs locaux

```bash
rm -rf airflow/logs/*
rm airflow/airflow.db  # Si installation locale
```

## 📚 Ressources supplémentaires

- [Documentation Airflow Officielle](https://airflow.apache.org/docs/)
- [Apache Airflow GitHub](https://github.com/apache/airflow)
- [Airflow Concepts](https://airflow.apache.org/docs/apache-airflow/stable/concepts/index.html)
- [DAG Writing Guide](https://airflow.apache.org/docs/apache-airflow/stable/howto/write-logs.html)

## 🐛 Dépannage

### Les DAGs ne s'affichent pas

1. Vérifiez que les fichiers sont dans `airflow/dags/`
2. Vérifiez la syntaxe Python : `python -m py_compile airflow/dags/*.py`
3. Redémarrez le scheduler : `docker compose restart airflow-scheduler`

### Erreur de connexion à la base de données

```bash
# Vérifier que PostgreSQL est en cours d'exécution
docker compose ps postgres-airflow

# Réinitialiser la base de données
docker compose exec airflow-webserver airflow db reset
```

### La tâche ne s'exécute pas

1. Vérifiez que le DAG est activé dans l'UI Airflow
2. Vérifiez que le scheduler est en cours d'exécution
3. Consultez les logs : `docker compose logs airflow-scheduler`

## 💡 Bonnes pratiques

1. **Idempotence** : Les tâches doivent être idempotentes (peut être relancées)
2. **Timeouts** : Définissez toujours des timeouts explicites
3. **XCom** : Utilisez XCom pour communiquer entre tâches
4. **Monitoring** : Configurez les alertes pour les DAG critiques
5. **Versioning** : Versionnez vos DAGs avec Git
6. **Documentation** : Documentez vos DAGs et tâches

## 📞 Support

Pour des questions ou des problèmes :

1. Consultez les logs : `docker compose logs <service>`
2. Vérifiez l'interface Airflow : http://localhost:8080
3. Consultez la documentation Airflow
4. Ouvrez une issue sur le repository
