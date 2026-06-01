# Orchestration Airflow - FoodFact Data Pipeline

## 📊 Vue d'ensemble de l'orchestration

L'intégration Airflow dans FoodFact automatise les tâches critiques de gestion de données :

```
┌─────────────────────────────────────────────────────────────────┐
│          Apache Airflow - Task Orchestration Platform           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  DAG 1: foodfact_data_orchestration (Quotidien, 02:00 UTC)     │
│  ├─ Health Check                     ← Vérifie la disponibilité│
│  ├─ Fetch Popular Products           ← Collecte données        │
│  ├─ Warm-up Backend Cache            ← Pré-charge le cache     │
│  ├─ Data Quality Check               ← Valide les données      │
│  └─ Generate Report                  ← Rapport d'exécution     │
│                                                                 │
│  DAG 2: cache_maintenance (Quotidien, 01:00 UTC)               │
│  ├─ Clear Expired Cache              ← Nettoyage              │
│  ├─ Analyze Cache Performance        ← Analyse                │
│  └─ Generate Maintenance Report      ← Rapport                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                        ↓ ↓ ↓
┌─────────────────────────────────────────────────────────────────┐
│                  Backend FoodFact (Scala)                       │
├─────────────────────────────────────────────────────────────────┤
│  • API REST (http4s)                                            │
│  • Cache (TTL: 300s)                                            │
│  • Rate Limiter (30 req/min)                                    │
│  • Health Check                                                 │
└─────────────────────────────────────────────────────────────────┘
                        ↓ ↓ ↓
┌─────────────────────────────────────────────────────────────────┐
│               OpenFoodFacts API (Externe)                       │
├─────────────────────────────────────────────────────────────────┤
│  • Recherche de produits                                        │
│  • Détails nutritionnels                                        │
│  • Scores (Nutri-Score, Eco-Score, NOVA)                       │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Flux de données

### Pipeline 1: foodfact_data_orchestration

```
Exécution: 02:00 UTC quotidiennement
Durée estimée: ~5-10 minutes
Dépendances: Backend actif, OpenFoodFacts API accessible
Critères de succès: Taux de succès cache ≥ 80%

Étape 1: Health Check (30s timeout)
│
├─ Vérifie Backend: GET http://backend:8080/health
├─ Vérifie OpenFoodFacts: GET https://world.openfoodfacts.org/...
│
└─ XCom: health_check_passed (bool)

Étape 2: Fetch Popular Products (N/A timeout)
│
├─ 14 requêtes en parallèle (apple, bread, milk, etc.)
├─ Récupère products: code, name, brands, nutriscore_grade, nova_group
│
└─ XCom: fetched_data {
    timestamp: str,
    total_products: int,
    search_results: list
}

Étape 3: Warm-up Backend Cache (N/A timeout)
│
├─ 10 requêtes au backend: GET /api/search?q=...
├─ Pré-charge le cache avec recherches populaires
│
└─ XCom: cache_stats {
    warmed_up_searches: int,
    total_attempts: int,
    failures: list
}

Étape 4: Data Quality Check (N/A timeout)
│
├─ Valide le taux de succès du cache warmup
├─ Critère: success_rate >= 80%
│
└─ XCom: quality_report {
    success_rate: float,
    status: 'PASSED' | 'WARNING'
}

Étape 5: Generate Report (N/A timeout)
│
├─ Agrège les résultats de toutes les étapes
├─ Log: Rapport d'exécution structuré
│
└─ XCom: pipeline_report {
    dag_id: str,
    run_id: str,
    status: str,
    health_check: bool,
    products_fetched: int,
    cache_warmed: int,
    quality_status: str
}
```

### Pipeline 2: cache_maintenance

```
Exécution: 01:00 UTC quotidiennement
Durée estimée: ~2-3 minutes
Dépendances: Aucune
Critères de succès: Maintenance completed

Étape 1: Clear Expired Cache
│
├─ Vérifie les entrées de cache expirées
├─ Note: Le backend gère automatiquement via TTL (300s)
│
└─ XCom: cache_clear_info {
    entries_cleared: int,
    status: str
}

Étape 2: Analyze Cache Performance
│
├─ Collecte les métriques de cache
├─ Génère un rapport de performance
│
└─ XCom: cache_metrics {
    success_rate: float,
    avg_response_time: float
}

Étape 3: Generate Maintenance Report
│
├─ Synthèse des tâches de maintenance
├─ Log: Rapport structuré
│
└─ XCom: maintenance_report {
    maintenance_tasks: list,
    status: str
}
```

## 🗂️ Structure des fichiers

```
airflow/
├── dags/                           # DAGs Airflow
│   ├── foodfact_orchestration.py   # Pipeline principal
│   └── cache_maintenance.py        # Maintenance du cache
│
├── plugins/                        # Opérateurs personnalisés
│   ├── foodfact_operators.py       # Classes d'opérateurs
│   └── __init__.py                 # Plugin registration
│
├── config/                         # Configuration
│   └── airflow.cfg                 # Config Airflow (optionnel)
│
├── logs/                           # Logs d'exécution
│   └── .gitkeep
│
├── requirements.txt                # Dépendances Python
├── README.md                       # Documentation complète
├── init.sh                         # Script d'initialisation
└── .env.example                    # Variables d'environnement
```

## 🔄 Intégration avec Docker Compose

### Services ajoutés

1. **postgres-airflow** : Base de données PostgreSQL
   - URL: `postgres-airflow:5432`
   - Utilisateur: `airflow`
   - Base: `airflow`
   - Port externe: `5433`

2. **airflow-scheduler** : Ordonnanceur Airflow
   - Rôle: Déclenche les DAGs selon le calendrier
   - Healthcheck: Vérification du code Airflow
   - Port: `8793`

3. **airflow-webserver** : Interface Web Airflow
   - URL: `http://localhost:8080`
   - Admin: `admin` / `admin`
   - Port: `8080`

4. **backend** : Backend FoodFact (modifié)
   - Port externe: `8090` (anciennement 8080)
   - Raison: Évite conflit avec Airflow Webserver

## 📈 Métriques et Monitoring

### Métriques collectées

#### Pipeline 1: foodfact_data_orchestration

| Métrique | Source | Formule |
|----------|--------|---------|
| Total Products Fetched | `fetched_data.total_products` | Somme |
| Cache Warmup Success Rate | `cache_stats` | `warmed_up_searches / total_attempts * 100` |
| Data Quality Status | `quality_report` | Pass/Warn/Fail |
| Pipeline Duration | Airflow UI | End - Start |

#### Pipeline 2: cache_maintenance

| Métrique | Source | Description |
|----------|--------|-------------|
| Cache Entries Cleared | `cache_clear_info` | Nombre d'entrées expirées |
| Cache Performance | `cache_metrics` | Taux hit/miss |
| Maintenance Status | `maintenance_report` | Success/Failure |

### Accès aux métriques

1. **Interface Airflow** : http://localhost:8080/admin/
   - Graphiques de durée
   - Taux de succès/échec
   - Timeline d'exécution

2. **Logs** : 
   ```bash
   docker compose logs airflow-scheduler
   docker compose logs airflow-webserver
   ```

3. **XCom** : 
   - Airflow UI → DAG → Grid View → Task → XCom
   - Ou via l'API Airflow

## 🛠️ Opérateurs personnalisés

### BackendHealthCheckOperator

```python
from foodfact_operators import BackendHealthCheckOperator

health_check = BackendHealthCheckOperator(
    task_id='health_check',
    backend_url='http://backend:8080',
    timeout=10,
)
```

**Retourne** :
```python
{
    'status': 'healthy',
    'response': {'status': 'ok'}
}
```

### CacheWarmupOperator

```python
from foodfact_operators import CacheWarmupOperator

warmup = CacheWarmupOperator(
    task_id='warmup_cache',
    backend_url='http://backend:8080',
    searches=['apple', 'bread', 'milk'],
    batch_size=5,
)
```

**Retourne** :
```python
{
    'successful': 10,
    'failed': 0,
    'success_rate': 100.0
}
```

### DataQualityCheckOperator

```python
from foodfact_operators import DataQualityCheckOperator

quality = DataQualityCheckOperator(
    task_id='quality_check',
    backend_url='http://backend:8080',
    min_success_rate=80.0,
)
```

**Retourne** :
```python
{
    'timestamp': '2024-01-01T02:30:00',
    'success_rate': 95.5,
    'threshold': 80.0,
    'status': 'PASSED'
}
```

## 🚨 Gestion des erreurs

### Politique de retry

```python
default_args = {
    'retries': 3,                    # Nombre de tentatives
    'retry_delay': timedelta(minutes=5),  # Délai entre tentatives
}
```

### Seuils d'alerte

| Condition | Action |
|-----------|--------|
| Health Check échoue | Marquer DAG comme Failed |
| Taux de succès < 50% | Marquer DAG comme Failed |
| Taux de succès 50-80% | Marquer DAG comme Warning |
| Taux de succès > 80% | Marquer DAG comme Success |

## 🔐 Sécurité

### Variables sensibles

```bash
# airflow/.env
AIRFLOW__CORE__FERNET_KEY=your_fernet_key
AIRFLOW__WEBSERVER__SECRET_KEY=your_secret_key
```

### Authentification

- Airflow WebServer : Basic Auth (admin/admin)
- Backend API : Rate Limiting (30 req/min)
- OpenFoodFacts API : Publique

### Permissions

- **Admin** : Accès complet à Airflow
- **User** : Lecture seule des DAGs
- **Viewer** : Accès aux logs

## 📊 Exemples de rapports

### Rapport d'orchestration

```json
{
  "execution_date": "2024-01-01T02:00:00",
  "dag_id": "foodfact_data_orchestration",
  "run_id": "scheduled__2024-01-01T02:00:00",
  "status": "SUCCESS",
  "health_check": true,
  "products_fetched": 1250,
  "cache_warmed": 10,
  "quality_status": "PASSED"
}
```

### Rapport de maintenance

```json
{
  "timestamp": "2024-01-01T01:00:00",
  "maintenance_tasks": [
    "Clear expired cache",
    "Analyze cache performance"
  ],
  "status": "COMPLETED"
}
```

## 🔗 Intégrations futures

1. **Slack** : Notifications d'alerte
2. **Email** : Rapports d'exécution
3. **Prometheus** : Métriques détaillées
4. **Grafana** : Dashboards de monitoring
5. **PostgreSQL** : Stockage des historiques
6. **Elasticsearch** : Centralisation des logs

## 📚 Ressources

- [Documentation Airflow](https://airflow.apache.org/docs/)
- [DAG Best Practices](https://airflow.apache.org/docs/apache-airflow/stable/best-practices.html)
- [Airflow Architecture](https://airflow.apache.org/docs/apache-airflow/stable/concepts/architecture.html)
- [Operators Guide](https://airflow.apache.org/docs/apache-airflow/stable/howto/operator/index.html)

## 📞 Support

Voir [airflow/README.md](./README.md) pour plus de détails.
