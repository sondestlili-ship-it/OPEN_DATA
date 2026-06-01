# 🚀 Integration Guide - Airflow pour FoodFact

## ✅ Checklist d'intégration

### 1. Structure des fichiers créés

```
✓ airflow/                                    # Dossier racine
  ├── dags/                                  # Pipelines Airflow
  │   ├── __init__.py                        # Package initialization
  │   ├── foodfact_orchestration.py          # DAG principal
  │   └── cache_maintenance.py               # DAG maintenance
  ├── plugins/                               # Opérateurs personnalisés
  │   ├── __init__.py                        # Plugin registration
  │   └── foodfact_operators.py              # Opérateurs custom
  ├── logs/                                  # Logs d'exécution
  ├── config/                                # Configuration
  ├── Dockerfile                             # Image Airflow custom
  ├── requirements.txt                       # Dépendances Python
  ├── init.sh                                # Script initialisation
  ├── .env.example                           # Variables d'env
  ├── .gitignore                             # Git ignore
  └── README.md                              # Documentation

✓ docker-compose.yml                         # Mis à jour avec services
✓ AIRFLOW_ORCHESTRATION.md                   # Documentation complète
✓ quickstart.sh                              # Script de démarrage rapide
```

### 2. Services Docker ajoutés

- ✓ `postgres-airflow` : Base de données PostgreSQL (port 5433)
- ✓ `airflow-scheduler` : Ordonnanceur Airflow (port 8793)
- ✓ `airflow-webserver` : Interface Web Airflow (port 8080)
- ✓ `backend` : Backend FoodFact (port 8090, anciennement 8080)
- ✓ `postgres-airflow-data` : Volume pour données PostgreSQL
- ✓ `foodfact-network` : Réseau bridge

### 3. Configuration mise à jour

```
✓ Backend port changé : 8080 → 8090
  Raison: Éviter conflit avec Airflow Webserver
  
✓ CORS mis à jour : ajouter localhost:8080
  Raison: Permettre requêtes depuis Airflow

✓ Healthcheck ajouté au backend
  Raison: Docker Compose peut attendre la disponibilité
```

## 🚀 Démarrage rapide

### Option 1 : Script automatique (Recommandé)

```bash
cd /path/to/foodfact
bash quickstart.sh
```

### Option 2 : Démarrage manuel

```bash
# 1. Naviguer vers le projet
cd /path/to/foodfact

# 2. Démarrer tous les services
docker compose up -d

# 3. Attendre que les services soient prêts (~30-60s)
sleep 30

# 4. Vérifier le status
docker compose ps

# 5. Accéder à Airflow
# URL: http://localhost:8080
# Login: admin / admin
```

### Option 3 : Démarrage progressif

```bash
# Démarrer PostgreSQL d'abord
docker compose up -d postgres-airflow

# Attendre que PostgreSQL soit prêt
sleep 10

# Démarrer les services Airflow
docker compose up -d airflow-scheduler airflow-webserver

# Démarrer le backend
docker compose up -d backend
```

## 📊 Vérification après démarrage

### 1. Vérifier les services

```bash
# Afficher l'état des services
docker compose ps

# Résultat attendu:
# NAME                    STATUS              PORTS
# postgres-airflow        Up (healthy)        5433->5432/tcp
# airflow-scheduler       Up (healthy)        8793/tcp
# airflow-webserver       Up (healthy)        0.0.0.0:8080->8080/tcp
# foodfact-backend        Up (healthy)        0.0.0.0:8090->8080/tcp
```

### 2. Vérifier les logs

```bash
# Logs Airflow Webserver
docker compose logs airflow-webserver | head -50

# Logs Airflow Scheduler
docker compose logs airflow-scheduler | head -50

# Logs Backend
docker compose logs backend | head -50
```

### 3. Tester les endpoints

```bash
# Health check Airflow (Webserver)
curl -u admin:admin http://localhost:8080/health

# Health check Backend
curl http://localhost:8090/health

# Expected: {"status":"ok"}
```

### 4. Accès à l'interface

- **Airflow UI** : http://localhost:8080
  - Username: `admin`
  - Password: `admin`

- **Backend API** : http://localhost:8090
  - Health: http://localhost:8090/health
  - Search: http://localhost:8090/api/search?q=apple

## 🔧 Configuration de base

### 1. Vérifier les DAGs

Dans l'interface Airflow :

1. Allez à **DAGs** (menu principal)
2. Vous devriez voir :
   - `cache_maintenance`
   - `foodfact_data_orchestration`

### 2. Activer les DAGs

1. Cliquez sur le DAG
2. Toggle le bouton **DAG** (en haut à gauche)
3. Le bouton passe au vert = Activé

### 3. Forcer une exécution test

```bash
# Via CLI (optionnel)
docker compose exec airflow-scheduler airflow dags test foodfact_data_orchestration 2024-01-01

# Ou manuellement via UI:
# 1. Allez au DAG
# 2. Cliquez sur "Trigger DAG" (bouton play)
# 3. Attendez l'exécution (2-5 minutes)
```

## 📝 Variables d'environnement

### Backend

```bash
# Backend Scala
PORT=8080
CORS_ORIGINS=http://localhost:3000,http://localhost:8080
OFF_TIMEOUT_MS=10000
CACHE_TTL_SECONDS=300
RATE_LIMIT_PER_MINUTE=30
```

### Airflow

```bash
# Core
AIRFLOW__CORE__EXECUTOR=LocalExecutor
AIRFLOW__CORE__DAGS_FOLDER=/opt/airflow/dags
AIRFLOW__CORE__BASE_LOG_FOLDER=/opt/airflow/logs

# Database
AIRFLOW__DATABASE__SQL_ALCHEMY_CONN=postgresql+psycopg2://airflow:airflow@postgres-airflow:5432/airflow

# Webserver
AIRFLOW__WEBSERVER__EXPOSE_CONFIG=true
AIRFLOW__CORE__LOAD_EXAMPLES=false
AIRFLOW__CORE__LOAD_DEFAULT_CONNECTIONS=false

# Security
_AIRFLOW_WWW_USER_CREATE=true
_AIRFLOW_WWW_USER_USERNAME=admin
_AIRFLOW_WWW_USER_PASSWORD=admin
```

## 🛑 Arrêt et nettoyage

### Arrêter les services

```bash
# Arrêter tous les services (conserver les données)
docker compose down

# Arrêter et supprimer les volumes (ATTENTION: données perdues)
docker compose down -v

# Arrêter un service spécifique
docker compose stop airflow-webserver
```

### Nettoyer les logs

```bash
# Nettoyer les logs Airflow
rm -rf airflow/logs/*

# Nettoyer la base de données (réinitialiser Airflow)
docker compose down -v postgres-airflow
```

## 🧪 Tests d'intégration

### Test 1 : Santé générale

```bash
#!/bin/bash
echo "Testing system health..."

echo "1. Testing PostgreSQL..."
docker compose exec -T postgres-airflow pg_isready -U airflow -d airflow

echo "2. Testing Airflow Webserver..."
curl -s -u admin:admin http://localhost:8080/health

echo "3. Testing Backend..."
curl -s http://localhost:8090/health

echo "4. Testing OpenFoodFacts API..."
curl -s "https://world.openfoodfacts.org/cgi/search.pl?search_terms=apple&json=1&page_size=1" | head -c 100

echo "✓ All checks completed"
```

### Test 2 : Exécution d'un DAG

```bash
# Forcer l'exécution du DAG principal
docker compose exec airflow-scheduler airflow dags test foodfact_data_orchestration 2024-01-01

# Résultat attendu: [2024-01-01 XX:XX:XX] {...} All tasks succeeded!
```

### Test 3 : Vérifier les logs

```bash
# Consulter les logs d'une task
docker compose exec -T airflow-webserver airflow tasks logs foodfact_data_orchestration health_check 2024-01-01T00:00:00

# Résultat attendu: Health checks completed successfully
```

## 📚 Documentation complète

- **[airflow/README.md](./airflow/README.md)** : Guide complet Airflow
- **[AIRFLOW_ORCHESTRATION.md](./AIRFLOW_ORCHESTRATION.md)** : Architecture orchestration
- **[DOCUMENTATION_COMPLETE.md](./DOCUMENTATION_COMPLETE.md)** : Documentation générale

## 🐛 Dépannage

### Les DAGs ne s'affichent pas

```bash
# 1. Vérifier la syntaxe
python -m py_compile airflow/dags/*.py

# 2. Vérifier les permissions
ls -la airflow/dags/

# 3. Redémarrer le scheduler
docker compose restart airflow-scheduler

# 4. Vérifier les logs
docker compose logs airflow-scheduler | grep -i dag
```

### Erreur "Connection refused"

```bash
# 1. Vérifier que PostgreSQL est prêt
docker compose exec postgres-airflow pg_isready

# 2. Attendre 30 secondes et réessayer
sleep 30
docker compose ps

# 3. Réinitialiser la base de données
docker compose down -v
docker compose up -d
```

### Backend ne répond pas

```bash
# 1. Vérifier le statut
docker compose ps backend

# 2. Vérifier les logs
docker compose logs backend

# 3. Restart si nécessaire
docker compose restart backend

# 4. Attendre le healthcheck
docker compose exec backend curl http://localhost:8080/health
```

## ✅ Post-installation

### 1. Mise à jour du frontend

```bash
cd frontend_react

# Installer les dépendances (si première fois)
npm install

# Lancer le frontend avec la bonne URL backend
NEXT_PUBLIC_API_URL=http://localhost:8090 npm run dev

# Frontend accessible à: http://localhost:3000
```

### 2. Monitoring des DAGs

```bash
# Afficher les prochaines exécutions
docker compose exec -T airflow-webserver airflow dags list-runs

# Afficher les tâches d'un DAG
docker compose exec -T airflow-webserver airflow tasks list foodfact_data_orchestration
```

### 3. Créer des DAGs personnalisés

Créez des fichiers dans `airflow/dags/` :

```python
# airflow/dags/my_custom_dag.py

from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator

def my_task(**context):
    print("Mon opérateur personnalisé")

default_args = {
    'owner': 'foodfact-team',
    'retries': 3,
    'start_date': datetime(2024, 1, 1),
}

dag = DAG(
    'my_custom_dag',
    default_args=default_args,
    schedule_interval='0 2 * * *',  # Quotidien
)

task = PythonOperator(
    task_id='my_task',
    python_callable=my_task,
    dag=dag,
)
```

Airflow détectera automatiquement le DAG dans 1-2 minutes.

## 📞 Support

En cas de problème:

1. Consultez les logs: `docker compose logs <service>`
2. Vérifiez l'interface Airflow: http://localhost:8080
3. Consultez [airflow/README.md](./airflow/README.md)
4. Consultez [AIRFLOW_ORCHESTRATION.md](./AIRFLOW_ORCHESTRATION.md)

## 🎉 Configuration complète !

Vous avez maintenant une infrastructure d'orchestration complète avec :

✅ Airflow Scheduler (automatisation)
✅ Airflow Webserver (monitoring)
✅ PostgreSQL (métadonnées)
✅ Backend FoodFact (API)
✅ 2 DAGs d'orchestration
✅ 3 opérateurs personnalisés
✅ Logs et monitoring

Vous pouvez maintenant :

1. **Monitorer les pipelines** : http://localhost:8080
2. **Ajouter de nouveaux DAGs** : `airflow/dags/`
3. **Créer des opérateurs** : `airflow/plugins/`
4. **Vérifier les métriques** : Airflow UI → DAGs → Statistiques

Bon travail ! 🚀
