# FoodFact Recherche

FoodFact Recherche est une application web complète permettant de rechercher et d'explorer des informations nutritionnelles détaillées sur des produits alimentaires en utilisant les données d'OpenFoodFacts.

## Vue d'ensemble

- **Frontend** : Application React/Next.js (port 3000)
- **Backend** : API REST Scala/http4s (port 8080)

## Fonctionnalités

- Recherche avec debounce et URL partageable
- Filtres : marque, pays, Nutri-Score, NOVA, valeurs nutritionnelles
- Pagination (« Charger plus »)
- Page détail : ingrédients, allergènes, NOVA, lien OpenFoodFacts
- Alternatives triées par Nutri-Score
- Mode clair / sombre
- Cache backend, rate limiting, health check

## Prérequis

- Git, Node.js 18+, npm
- Scala 3.3+, sbt, Java 17+
- Docker (optionnel, pour le backend)

## Installation

```bash
git clone https://github.com/Yamnyr/NutriRecherche.git
cd NutriRecherche

cd frontend_react && npm install
# Backend : sbt télécharge les dépendances au premier lancement
```

## Lancement

### Backend (local)

```bash
cd backend_scala
.\sbt.bat run   # Windows
# sbt run       # Linux/Mac
```

Health check : [http://localhost:8080/health](http://localhost:8080/health)

### Frontend

```bash
cd frontend_react
cp .env.example .env.local   # optionnel
npm run dev
```

Application : [http://localhost:3000](http://localhost:3000)

### Docker (backend uniquement)

```bash
docker compose up --build backend
```

Puis lancer le frontend en local avec `NEXT_PUBLIC_API_URL=http://localhost:8080`.

## API

### `GET /health`

Réponse : `{"status":"ok"}`

### `GET /api/search`

| Paramètre | Description |
|-----------|-------------|
| `q` | Terme de recherche (optionnel si filtres actifs) |
| `brand` | Filtre marque |
| `country` | Filtre pays |
| `nutriscore` | Grades séparés par virgule (`a,b,c`) |
| `nova` | Groupes NOVA (`1,2,3,4`) |
| `minEnergy`, `maxEnergy` | Plage énergie (kcal) |
| `minSugar`, `maxSugar` | Plage sucres (g) |
| `minFat`, `maxFat` | Plage graisses (g) |
| `sortBy` | `energy`, `sugars`, `fat`, `nutriscore` |
| `order` | `asc` ou `desc` |
| `page`, `pageSize` | Pagination (max 100 par page) |

Réponse :

```json
{
  "count": 12,
  "totalFromOff": 1234,
  "page": 1,
  "pageSize": 50,
  "products": [...]
}
```

### `GET /api/product/{code}`

Retourne le produit et des alternatives par catégorie (tri Nutri-Score).

## Configuration

### Frontend

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Backend

| Variable | Défaut | Description |
|----------|--------|-------------|
| `PORT` | 8080 | Port du serveur |
| `CORS_ORIGINS` | `http://localhost:3000` | Origines autorisées (séparées par virgule) |
| `OFF_TIMEOUT_MS` | 10000 | Timeout appels OpenFoodFacts |
| `CACHE_TTL_SECONDS` | 300 | Durée du cache en mémoire |
| `RATE_LIMIT_PER_MINUTE` | 30 | Limite par IP |

## Tests backend

```bash
cd backend_scala
sbt test
```

## Structure

```
foodfact/
├── frontend_react/     # Next.js + TypeScript + Tailwind
├── backend_scala/      # Scala 3 + http4s + Circe
├── docker-compose.yml
└── README.md
```

## Technologies

**Frontend** : Next.js, TypeScript, Tailwind CSS, Recharts, Lucide

**Backend** : Scala 3, http4s, Circe, Cats Effect, MUnit

## License

MIT

## Remerciements

- [OpenFoodFacts](https://world.openfoodfacts.org/) pour l'API et les données
