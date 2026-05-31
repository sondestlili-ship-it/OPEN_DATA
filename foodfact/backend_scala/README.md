# FoodFact Recherche - Backend

API REST backend construite avec Scala 3 et http4s pour servir les données nutritionnelles d'OpenFoodFacts.

## 📋 Vue d'ensemble

Le backend de FoodFact Recherche expose une API REST qui :
- Recherche des produits dans OpenFoodFacts
- Filtre les résultats selon différents critères
- Retourne les détails complets d'un produit
- Fournit des alternatives de produits

## 🚀 Prérequis

- **Java 17+** (recommandé : Java 21)
- **sbt** (Scala Build Tool) 1.9+
- **Scala 3.3+**

### Installation de sbt sur Windows

Si `sbt` n'est pas installé globalement, utilisez le script `sbt.bat` fourni dans ce dossier.

## 📦 Installation

Les dépendances sont gérées automatiquement par sbt. Aucune installation manuelle n'est nécessaire.

## 🏃 Développement

### Windows

```bash
# Compiler et lancer
.\sbt.bat clean compile
.\sbt.bat run
```

### Linux/Mac

```bash
# Compiler et lancer
sbt clean compile
sbt run
```

Le serveur sera disponible sur [http://localhost:8080](http://localhost:8080)

## 🏗️ Build de production

```bash
# Créer un JAR exécutable
sbt assembly

# Le JAR sera dans target/scala-3.3.1/
java -jar target/scala-3.3.1/foodfact-recherche-assembly-0.1.0-SNAPSHOT.jar
```

## 📁 Structure du projet

```
backend_scala/
├── src/main/scala/
│   ├── Models.scala          # Modèles de données (Product, Nutriments, etc.)
│   ├── OpenFoodClient.scala  # Client HTTP pour OpenFoodFacts API
│   └── Server.scala          # Serveur HTTP, routes et logique métier
│
├── build.sbt                 # Configuration du projet
├── sbt.bat                   # Script de lancement sbt (Windows)
└── README.md                 # Ce fichier
```

## 🔧 Configuration

### Port

Le serveur écoute par défaut sur le port **8080**. Pour changer le port, modifiez `Server.scala` :

```scala
.withPort(port"8080")  // Changez ici
```

### CORS

Le serveur est configuré pour accepter les requêtes depuis n'importe quelle origine. Pour restreindre, modifiez `Server.scala` :

```scala
val corsConfig = CORSConfig.default
  .withAnyOrigin(false)
  .withAllowedOrigins(Set("http://localhost:3000"))
```

## 📡 API Endpoints

### GET /api/search

Recherche de produits avec filtres.

**Paramètres de requête :**
- `q` (requis) : Terme de recherche
- `brand` (optionnel) : Filtrer par marque
- `country` (optionnel) : Filtrer par pays
- `sortBy` (optionnel) : Trier par (`energy`, `sugars`, `fat`)
- `order` (optionnel) : Ordre de tri (`asc`, `desc`)
- `minEnergy`, `maxEnergy` : Plage d'énergie (kcal/100g)
- `minSugar`, `maxSugar` : Plage de sucres (g/100g)
- `minFat`, `maxFat` : Plage de matières grasses (g/100g)

**Exemple :**
```
GET /api/search?q=eau&country=France&minEnergy=0&maxEnergy=50
```

**Réponse :**
```json
{
  "count": 10,
  "products": [...]
}
```

### GET /api/product/{barcode}

Détails d'un produit par code-barres.

**Exemple :**
```
GET /api/product/3017620422003
```

**Réponse :**
```json
{
  "product": {...},
  "alternatives": [...]
}
```

## 🛠️ Technologies

- **Scala 3** - Langage de programmation moderne
- **http4s** - Framework HTTP fonctionnel
- **Cats Effect** - Programmation asynchrone et effets
- **Circe** - Sérialisation/désérialisation JSON
- **Ember** - Serveur HTTP haute performance

## 🔍 Logique de filtrage

### Filtre par pays

Le backend normalise les noms de pays pour gérer différentes variantes :
- Formats : "France", "fr", "en:france", "fr:france"
- Support multilingue (français/anglais)
- Correspondance stricte pour éviter les faux positifs

### Filtrage nutritionnel

Les filtres nutritionnels utilisent des comparaisons numériques :
- `minEnergy` : Énergie >= valeur
- `maxEnergy` : Énergie <= valeur
- Même logique pour sucres et matières grasses

## ⚡ Performance

- **Requêtes asynchrones** avec Cats Effect IO
- **Client HTTP réutilisable** pour éviter les surcoûts
- **Filtrage efficace** avec les collections Scala
- **Pas de cache** (peut être ajouté si nécessaire)

## 🐛 Dépannage

### Erreur "sbt not found"

Sur Windows, utilisez `.\sbt.bat` au lieu de `sbt`.

### Erreur de port déjà utilisé

```bash
# Trouver le processus utilisant le port 8080
netstat -ano | findstr :8080  # Windows
lsof -i :8080                 # Linux/Mac

# Tuer le processus ou changer le port dans Server.scala
```

### Erreurs de compilation

```bash
# Nettoyer et recompiler
sbt clean
sbt update
sbt compile
```

## 📝 Dépendances principales

Voir `build.sbt` pour la liste complète. Principales dépendances :

- `org.http4s` - Framework HTTP
- `org.typelevel` - Cats Effect
- `io.circe` - JSON
- `com.comcast.ip4s` - IP et ports

## 🔗 Liens utiles

- [Documentation Scala 3](https://docs.scala-lang.org/scala3/)
- [Documentation http4s](https://http4s.org/)
- [Documentation Cats Effect](https://typelevel.org/cats-effect/)
- [OpenFoodFacts API](https://world.openfoodfacts.org/data)
