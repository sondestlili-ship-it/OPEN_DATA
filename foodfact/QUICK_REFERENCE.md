# 🎯 FoodFact + Airflow - Quick Reference

## 🚀 Démarrage rapide

```bash
# Clone du projet (déjà fait)
git clone https://github.com/BOUSSADAIT0/OPEN_DATA.git
cd OPEN_DATA/foodfact

# Démarrage complet (Docker)
docker compose up -d

# Vérifier le statut
docker compose ps

# Accéder à Airflow
# http://localhost:8080 (admin/admin)
```

## 📊 Accès aux services

| Service | URL | Purpose |
|---------|-----|---------|
| **Airflow** | http://localhost:8080 | Orchestration UI |
| **Backend** | http://localhost:8090/health | API FoodFact |
| **Frontend** | http://localhost:3000 | Web UI (local) |

## 🔧 Commandes principales

### Docker Compose

```bash
# Démarrer tous les services
docker compose up -d

# Arrêter tous les services
docker compose down

# Arrêter et supprimer les volumes
docker compose down -v

# Voir les logs d'un service
docker compose logs -f <service_name>

# Voir les logs de tous les services
docker compose logs -f

# Redémarrer un service
docker compose restart <service_name>

# Exécuter une commande dans un conteneur
docker compose exec <service_name> <command>
```

### Services disponibles

```bash
# postgres-airflow
docker compose exec postgres-airflow pg_isready

# airflow-scheduler
docker compose logs -f airflow-scheduler

# airflow-webserver
docker compose logs -f airflow-webserver

# backend
docker compose logs -f backend
```

## 🎯 Airflow - Gestion des DAGs

### Via CLI

```bash
# Lister tous les DAGs
docker compose exec airflow-scheduler airflow dags list

# Afficher les tâches d'un DAG
docker compose exec airflow-scheduler airflow tasks list foodfact_data_orchestration

# Tester un DAG
docker compose exec airflow-scheduler airflow dags test foodfact_data_orchestration 2024-01-01

# Déclencher un DAG
docker compose exec airflow-scheduler airflow dags trigger foodfact_data_orchestration

# Afficher les logs d'une tâche
docker compose exec airflow-scheduler airflow tasks logs foodfact_data_orchestration health_check 2024-01-01T00:00:00
```

### Via Interface Web

1. Aller à http://localhost:8080
2. Login: admin / admin
3. DAGs:
   - `foodfact_data_orchestration` (Orchestration)
   - `cache_maintenance` (Maintenance)
4. Cliquer sur un DAG pour voir les détails
5. Bouton "Trigger DAG" pour déclencher manuellement

## 🔐 Gestion des utilisateurs Airflow

```bash
# Créer un nouvel utilisateur
docker compose exec airflow-webserver airflow users create \
  --username user123 \
  --firstname User \
  --lastname Test \
  --role Admin \
  --email user@example.com \
  --password password123

# Lister les utilisateurs
docker compose exec airflow-webserver airflow users list

# Changer le mot de passe
docker compose exec airflow-webserver airflow users delete --username user123
```

## 📝 Frontend - Configuration

```bash
# Naviguer vers frontend
cd frontend_react

# Installer les dépendances (première fois)
npm install

# Démarrer en développement
NEXT_PUBLIC_API_URL=http://localhost:8090 npm run dev

# Construire pour production
npm run build
npm start

# Frontend sera accessible à: http://localhost:3000
```

## 🐛 Dépannage

### Services ne démarrent pas

```bash
# Vérifier les erreurs
docker compose logs

# Vérifier les ports disponibles
netstat -tuln | grep -E "8080|8090|5433"

# Réinitialiser complètement
docker compose down -v
docker compose up -d
```

### Airflow n'initialise pas la base de données

```bash
# Initialiser la base manuellement
docker compose exec airflow-webserver airflow db upgrade

# Créer l'admin user manuellement
docker compose exec airflow-webserver airflow users create \
  --username admin \
  --firstname Admin \
  --lastname User \
  --role Admin \
  --email admin@example.com \
  --password admin
```

### Backend ne répond pas

```bash
# Vérifier les logs
docker compose logs backend

# Vérifier la santé
curl http://localhost:8090/health

# Redémarrer le service
docker compose restart backend
```

## 🔄 Workflows typiques

### Ajouter un nouveau DAG

```bash
# 1. Créer le fichier
cat > airflow/dags/mon_dag.py << 'EOF'
from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator

def my_task(**context):
    print("Hello from my DAG!")

default_args = {
    'owner': 'foodfact-team',
    'retries': 3,
    'start_date': datetime(2024, 1, 1),
}

dag = DAG(
    'mon_dag',
    default_args=default_args,
    schedule_interval='0 2 * * *',
)

task = PythonOperator(
    task_id='my_task',
    python_callable=my_task,
    dag=dag,
)
EOF

# 2. Airflow détecte le DAG automatiquement en ~1-2 min
# 3. Accéder à http://localhost:8080 et voir le nouveau DAG
```

### Modifier un DAG existant

```bash
# 1. Modifier le fichier
nano airflow/dags/foodfact_orchestration.py

# 2. Redémarrer le scheduler
docker compose restart airflow-scheduler

# 3. Vérifier les changements dans Airflow UI
```

### Vérifier l'exécution d'un DAG

```bash
# Via CLI
docker compose exec airflow-scheduler airflow dags list-runs

# Via UI
# DAGs → Cliquer sur le DAG → Grid View ou Calendar
```

## 📊 Monitoring

### Logs

```bash
# Tous les services
docker compose logs

# Services spécifiques
docker compose logs -f airflow-webserver
docker compose logs -f airflow-scheduler
docker compose logs -f backend

# Dernières 50 lignes
docker compose logs --tail 50

# Suivi en temps réel
docker compose logs -f
```

### Santé des services

```bash
# Vérifier le statut
docker compose ps

# Health checks
curl http://localhost:8080/health              # Airflow Webserver
curl http://localhost:8090/health              # Backend
docker compose exec postgres-airflow pg_isready -U airflow
```

### Performance

```bash
# Utilisation CPU/Mémoire
docker stats

# Informations détaillées
docker compose exec <service> top
```

## 🔐 Sécurité

### Changement du mot de passe admin

```bash
docker compose exec airflow-webserver airflow users delete --username admin
docker compose exec airflow-webserver airflow users create \
  --username admin \
  --firstname Admin \
  --lastname User \
  --role Admin \
  --email admin@example.com \
  --password nouveaumdp
```

### Ajouter une connexion HTTP personnalisée

```bash
docker compose exec airflow-webserver airflow connections add my_connection \
  --conn-type http \
  --conn-host example.com \
  --conn-port 443 \
  --conn-login user \
  --conn-password pass
```

## 🗂️ Structure des fichiers importants

```
foodfact/
├── airflow/
│   ├── dags/
│   │   ├── foodfact_orchestration.py    # DAG principal
│   │   └── cache_maintenance.py         # DAG maintenance
│   ├── plugins/
│   │   └── foodfact_operators.py        # Opérateurs custom
│   └── README.md                        # Doc complète
│
├── backend_scala/                       # Backend API
│   └── src/main/scala/Server.scala
│
├── frontend_react/                      # Frontend UI
│   └── app/page.tsx
│
└── docker-compose.yml                   # Configuration Docker
```

## 📚 Documentation complète

- **[airflow/README.md](./airflow/README.md)** - Guide complet Airflow
- **[AIRFLOW_ORCHESTRATION.md](./AIRFLOW_ORCHESTRATION.md)** - Architecture
- **[AIRFLOW_INTEGRATION.md](./AIRFLOW_INTEGRATION.md)** - Guide d'intégration
- **[ARCHITECTURE_GENERALE.md](./ARCHITECTURE_GENERALE.md)** - Architecture générale

## 🆘 Support

```bash
# Vérifier l'installation
bash validate_integration.sh

# Afficher la structure du projet
cat PROJECT_STRUCTURE.md

# Quick start automatique
bash quickstart.sh
```

## 🎯 Ports utilisés

| Service | Port | Use |
|---------|------|-----|
| Airflow Webserver | 8080 | UI Airflow |
| Airflow Scheduler | 8793 | Ordonnanceur |
| Backend API | 8090 | API FoodFact |
| PostgreSQL | 5433 | DB Airflow |
| Frontend | 3000 | Web UI (local) |

## ⏰ Horaires d'exécution par défaut

| DAG | Schedule | Time (UTC) |
|-----|----------|-----------|
| foodfact_data_orchestration | Daily | 02:00 |
| cache_maintenance | Daily | 01:00 |

## 💡 Tips & Tricks

```bash
# Démarrage rapide complet
docker compose up -d && sleep 30

# Afficher les DAGs disponibles
docker compose exec airflow-scheduler airflow dags list

# Tail des logs en temps réel
docker compose logs -f --tail 50

# Nettoyer les volumes (réinitialiser complètement)
docker compose down -v

# Rebuild les images
docker compose up -d --build

# Connexion à PostgreSQL
docker compose exec postgres-airflow psql -U airflow -d airflow
```

---

**Quick Reference Complète pour FoodFact + Airflow**

Pour des questions détaillées, consultez la documentation complète dans les fichiers .md du projet.
