# 📚 Documentation Complète - FoodFact

## 🎯 Vue d'ensemble du projet

**FoodFact** est une application web complète pour rechercher et analyser des informations nutritionnelles de produits alimentaires. Le projet est composé de deux parties principales :

1. **Backend Scala** : API REST qui communique avec OpenFoodFacts
2. **Frontend React/Next.js** : Interface utilisateur moderne avec visualisations

---

## 🏗️ Architecture du Backend (Scala)

Le backend utilise **Scala 3** avec le framework **http4s** pour créer une API REST performante et asynchrone.

### 📁 Structure des fichiers backend

```
backend_scala/
├── src/main/scala/
│   ├── Server.scala          ⭐ FICHIER LE PLUS IMPORTANT
│   ├── OpenFoodClient.scala  🔧 Client HTTP
│   └── Models.scala          📦 Modèles de données
├── build.sbt                 ⚙️ Configuration du projet
└── README.md                 📖 Documentation
```

---

## ⭐ FICHIER LE PLUS IMPORTANT : `Server.scala`

**Pourquoi c'est le fichier le plus important ?**

`Server.scala` est le **cœur de l'application backend**. C'est lui qui :
- ✅ Démarre le serveur HTTP
- ✅ Définit toutes les routes API
- ✅ Gère la logique métier (filtrage, tri)
- ✅ Configure CORS pour permettre les requêtes frontend
- ✅ Orchestre les appels à OpenFoodFacts via `OpenFoodClient`

**Sans ce fichier, l'application ne fonctionnerait pas du tout !**

### 🔍 Détails de `Server.scala`

#### 1. **Point d'entrée de l'application**
```scala
object Server extends IOApp {
  override def run(args: List[String]): IO[ExitCode] = {
    // Code principal ici
  }
}
```
- `IOApp` : Point d'entrée pour les applications Cats Effect
- `IO[ExitCode]` : Gère les effets asynchrones et les erreurs

#### 2. **Normalisation des pays**
```scala
private val countryVariants: Map[String, Set[String]] = Map(
  "france" -> Set("france", "fr", "en:france", "fr:france", ...),
  ...
)
```
**Rôle** : Permet de reconnaître un pays même si l'utilisateur tape "France", "fr", "en:france", etc.
- Gère les variantes multilingues (français/anglais)
- Supporte les formats OpenFoodFacts (`en:`, `fr:`)

#### 3. **Route de recherche : `/api/search`**
```scala
case GET -> Root / "api" / "search" :? QParam(maybeQ) +& ... =>
```

**Fonctionnalités** :
- ✅ Recherche de produits via OpenFoodFacts
- ✅ Filtrage par pays, marque, valeurs nutritionnelles
- ✅ Tri par énergie, sucres, ou matières grasses
- ✅ Ordre ascendant ou descendant

**Paramètres acceptés** :
- `q` : Terme de recherche (obligatoire)
- `country` : Pays (ex: "France", "fr")
- `sortBy` : "energy", "sugars", ou "fat"
- `order` : "asc" ou "desc"
- `minEnergy`, `maxEnergy` : Plage d'énergie (kcal)
- `minSugar`, `maxSugar` : Plage de sucres (g)
- `minFat`, `maxFat` : Plage de matières grasses (g)

**Logique de filtrage** :
```scala
val filtered = resp.products
  .filter(p => maybeCountry.forall(c => p.countries.exists(cs => countryMatches(cs, c))))
  .filter(p => maybeBrand.forall(b => p.brands.exists(_.toLowerCase.contains(b.toLowerCase))))
  .filter(p => minEnergy.forall(min => p.nutriments.flatMap(_.energy).exists(_ >= min)))
  // ... autres filtres
```

**Logique de tri** :
```scala
val sorted = (maybeSortBy, maybeOrder) match {
  case (Some("energy"), Some("desc")) => filtered.sortBy(_.nutriments.flatMap(_.energy)).reverse
  case (Some("energy"), _)            => filtered.sortBy(_.nutriments.flatMap(_.energy))
  // ... autres cas
}
```

#### 4. **Route de détail produit : `/api/product/{barcode}`**
```scala
case GET -> Root / "api" / "product" / barcode =>
```

**Fonctionnalités** :
- ✅ Récupère les détails complets d'un produit
- ✅ Trouve automatiquement 8 alternatives (produits similaires)
- ✅ Retourne le produit et ses alternatives en JSON

**Logique** :
```scala
for {
  product <- api.getProduct(barcode)  // Détails du produit
  alternatives <- api.rawSearch(product.product_name.getOrElse(""))
    .map(_.products.filter(_.code != barcode).take(8))  // 8 alternatives
  res <- Ok(Map("product" -> product.asJson, "alternatives" -> alternatives.asJson).asJson)
} yield res
```

#### 5. **Configuration CORS**
```scala
val corsConfig = CORSConfig.default
  .withAnyOrigin(true)
  .withAnyMethod(true)
  .withAllowCredentials(true)
```
**Rôle** : Permet au frontend (qui tourne sur un autre port) de faire des requêtes au backend.

#### 6. **Démarrage du serveur**
```scala
EmberServerBuilder
  .default[IO]
  .withPort(port"8080")
  .withHost(ipv4"0.0.0.0")
  .withHttpApp(httpAppWithCors)
  .build
  .useForever
```
- **Port** : 8080
- **Host** : 0.0.0.0 (accessible depuis n'importe quelle interface réseau)
- **useForever** : Le serveur tourne indéfiniment jusqu'à arrêt manuel

---

## 🔧 `OpenFoodClient.scala` - Client HTTP

**Rôle** : Fait les requêtes HTTP vers l'API OpenFoodFacts.

### Méthodes principales

#### 1. `rawSearch(query: String): IO[SearchResponse]`
```scala
def rawSearch(query: String): IO[SearchResponse] = {
  val uri = uri"https://world.openfoodfacts.org/cgi/search.pl"
    .withQueryParams(...)
  client.expect[SearchResponse](Request[IO](method = Method.GET, uri = uri))
}
```
**Rôle** :
- ✅ Recherche de produits sur OpenFoodFacts
- ✅ Récupère jusqu'à 50 produits
- ✅ Inclut les images et tous les champs nécessaires

**Champs récupérés** :
- `code`, `product_name`, `brands`, `categories`, `quantity`
- `nutriscore_grade`, `ecoscore_grade`, `nova_group`
- `ingredients_text`, `allergens`, `labels`, `countries`
- `image_small_url`, `image_url`
- `nutriments` (énergie, sucres, sel, graisses, protéines, fibres)

#### 2. `getProduct(barcode: String): IO[Product]`
```scala
def getProduct(barcode: String): IO[Product] = {
  val uri = uri"https://world.openfoodfacts.org/api/v0/product" / s"$barcode.json"
  client.expect[ProductResponse](Request[IO](Method.GET, uri)).map { resp =>
    resp.product.getOrElse(Product(...))  // Produit par défaut si introuvable
  }
}
```
**Rôle** :
- ✅ Récupère les détails d'un produit spécifique par code-barres
- ✅ Utilise l'API v0 d'OpenFoodFacts (plus complète)
- ✅ Retourne un produit par défaut si introuvable

#### 3. `getAlternatives(product: Product): IO[List[Product]]`
```scala
def getAlternatives(product: Product): IO[List[Product]] = {
  val mainCategory = product.categories.flatMap(_.split(",").headOption).getOrElse("")
  if mainCategory.isBlank then IO.pure(Nil)
  else rawSearch(mainCategory).map { resp =>
    resp.products.filter(p => p.code != product.code).take(10)
  }
}
```
**Rôle** :
- ✅ Trouve des alternatives basées sur la catégorie principale
- ✅ Exclut le produit actuel
- ✅ Limite à 10 alternatives

**Note** : Cette méthode n'est pas utilisée dans `Server.scala` actuellement. Le serveur utilise plutôt `rawSearch` directement.

---

## 📦 `Models.scala` - Modèles de données

**Rôle** : Définit la structure des données utilisées dans l'application.

### 1. `Nutriments`
```scala
case class Nutriments(
  energy: Option[Double],    // Énergie en kcal/100g
  sugars: Option[Double],    // Sucres en g/100g
  salt: Option[Double],      // Sel en g/100g
  fat: Option[Double],       // Matières grasses en g/100g
  proteins: Option[Double],  // Protéines en g/100g
  fiber: Option[Double]      // Fibres en g/100g
)
```
**Rôle** : Représente les valeurs nutritionnelles d'un produit.

**Décodage JSON personnalisé** :
```scala
given Decoder[Nutriments] = new Decoder[Nutriments] {
  def apply(c: HCursor): Decoder.Result[Nutriments] =
    for {
      energy   <- c.downField("energy-kcal_100g").as[Option[Double]]
      sugars   <- c.downField("sugars_100g").as[Option[Double]]
      // ... autres champs
    } yield Nutriments(energy, sugars, salt, fat, proteins, fiber)
}
```
**Pourquoi personnalisé ?** OpenFoodFacts utilise des noms de champs spécifiques (`energy-kcal_100g` au lieu de `energy`).

### 2. `Product`
```scala
case class Product(
  code: String,                      // Code-barres (unique)
  product_name: Option[String],      // Nom du produit
  brands: Option[String],            // Marques
  categories: Option[String],        // Catégories (séparées par virgules)
  quantity: Option[String],          // Quantité (ex: "400g")
  nutriscore_grade: Option[String], // Nutri-Score (A, B, C, D, E)
  ecoscore_grade: Option[String],   // Éco-Score (A, B, C, D, E, ou "NOT-APPLICABLE")
  nova_group: Option[Int],          // Groupe NOVA (1-4)
  ingredients_text: Option[String], // Liste des ingrédients
  allergens: Option[String],         // Allergènes
  additives_tags: Option[List[String]], // Additifs
  labels: Option[String],           // Labels (bio, etc.)
  countries: Option[String],        // Pays (séparés par virgules)
  image_url: Option[String],        // URL image principale
  image_small_url: Option[String],  // URL image petite
  image_front_url: Option[String],  // URL image face avant
  nutriments: Option[Nutriments]    // Valeurs nutritionnelles
)
```
**Rôle** : Représente un produit alimentaire complet.

**Tous les champs sont `Option`** car OpenFoodFacts peut ne pas avoir toutes les données pour chaque produit.

### 3. `ProductResponse`
```scala
case class ProductResponse(
  code: String,
  product: Option[Product]
)
```
**Rôle** : Format de réponse de l'API OpenFoodFacts pour un produit unique.

### 4. `SearchResponse`
```scala
case class SearchResponse(
  count: Int,
  products: List[Product]
)
```
**Rôle** : Format de réponse de l'API OpenFoodFacts pour une recherche.

**Note** : Le `count` dans la réponse OpenFoodFacts peut être différent du nombre réel de produits retournés (pagination).

---

## ⚙️ `build.sbt` - Configuration du projet

**Rôle** : Définit les dépendances et la configuration du projet Scala.

### Dépendances principales

1. **http4s** (v0.23.26)
   - `http4s-ember-server` : Serveur HTTP
   - `http4s-ember-client` : Client HTTP
   - `http4s-dsl` : DSL pour définir les routes
   - `http4s-circe` : Intégration JSON avec Circe

2. **Circe** (v0.14.6)
   - `circe-core` : Bibliothèque JSON
   - `circe-generic` : Dérivation automatique d'encodeurs/décodeurs
   - `circe-parser` : Parsing JSON

3. **Logback** (v1.4.11)
   - `logback-classic` : Logging

### Version Scala
```scala
scalaVersion := "3.3.1"
```

---

## 🎨 Architecture du Frontend (React/Next.js)

### 📁 Structure des fichiers frontend

```
frontend_react/
├── app/
│   ├── page.tsx                    ⭐ Page principale
│   ├── product/[code]/
│   │   ├── page.tsx                📄 Page produit (serveur)
│   │   └── ProductClient.tsx       🎨 Composant produit (client)
│   └── globals.css                 🎨 Styles globaux
├── components/
│   ├── ProductCard.tsx             🃏 Carte produit
│   ├── SearchFilters.tsx           🔍 Filtres de recherche
│   ├── DataTable.tsx               📊 Tableau de données
│   ├── ProductStats.tsx            📈 Statistiques
│   └── ui/                         🧩 Composants UI (shadcn/ui)
├── lib/
│   ├── api.ts                      🌐 Appels API
│   ├── types.ts                    📦 Types TypeScript
│   └── dataUtils.ts                🔧 Utilitaires données
└── package.json                    ⚙️ Dépendances
```

---

## 🌐 `lib/api.ts` - Communication avec le backend

**Rôle** : Fonctions pour appeler l'API backend.

### 1. `searchProducts(params: any): Promise<SearchResponse>`
```typescript
export async function searchProducts(params: any): Promise<SearchResponse> {
  const entries = Object.entries(params || {}).filter(([k, v]) => {
    if (k === "q") return true
    return v !== undefined && v !== null && String(v).trim() !== ""
  })
  const qs = new URLSearchParams(entries as any)
  const url = `${API_URL}/api/search?` + qs.toString()
  const res = await fetch(url)
  return res.json()
}
```
**Rôle** :
- ✅ Nettoie les paramètres vides (sauf `q`)
- ✅ Construit l'URL avec les paramètres de requête
- ✅ Fait la requête GET au backend
- ✅ Retourne les produits trouvés

**Pourquoi filtrer les valeurs vides ?** Pour éviter d'envoyer `brand=""` qui pourrait matcher tous les produits.

### 2. `getProduct(code: string): Promise<ProductDetailResponse>`
```typescript
export async function getProduct(code: string): Promise<ProductDetailResponse> {
  const res = await fetch(`${API_URL}/api/product/${code}`)
  return res.json()
}
```
**Rôle** : Récupère les détails d'un produit et ses alternatives.

---

## 📦 `lib/types.ts` - Types TypeScript

**Rôle** : Définit les interfaces TypeScript correspondant aux modèles Scala.

### Interfaces principales

1. **`Nutriments`** : Valeurs nutritionnelles
2. **`Product`** : Produit (version simplifiée du modèle Scala)
3. **`SearchResponse`** : Réponse de recherche
4. **`ProductDetailResponse`** : Réponse détail produit (avec alternatives)
5. **`SearchFilters`** : Filtres de recherche

**Note** : Les types frontend sont simplifiés par rapport aux modèles Scala (moins de champs).

---

## 🎨 `app/page.tsx` - Page principale

**Rôle** : Page d'accueil avec recherche et affichage des résultats.

### Fonctionnalités

1. **Barre de recherche**
   - Input avec bouton de recherche
   - Debounce de 300ms pour éviter trop de requêtes

2. **Filtres horizontaux**
   - Pays, tri, plages nutritionnelles
   - Composant `SearchFilters`

3. **Modes d'affichage**
   - **Grille** : Cartes produits (`ProductCard`)
   - **Tableau** : Tableau de données (`DataTable`)
   - **Statistiques** : Graphiques (`ProductStats`)

4. **Gestion d'état**
   - `query` : Terme de recherche
   - `filters` : Filtres appliqués
   - `products` : Liste des produits
   - `loading` : État de chargement
   - `viewMode` : Mode d'affichage actuel

### Logique de recherche
```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    fetchData()
  }, 300)
  return () => clearTimeout(timer)
}, [query, filters])
```
**Rôle** : Déclenche la recherche 300ms après la dernière modification de `query` ou `filters` (debounce).

---

## 🃏 `components/ProductCard.tsx` - Carte produit

**Rôle** : Affiche un produit dans une carte visuelle.

### Fonctionnalités

- ✅ Image du produit
- ✅ Nom et marque
- ✅ Badges Nutri-Score et Éco-Score
- ✅ 3 valeurs nutritionnelles principales (énergie, sucres, graisses)
- ✅ Lien vers la page détail
- ✅ Design moderne avec effets NFT (bordures animées, particules, 3D hover)

---

## 🔍 `components/SearchFilters.tsx` - Filtres de recherche

**Rôle** : Interface pour filtrer les produits.

### Filtres disponibles

1. **Pays** : Liste déroulante (France, Belgique, Suisse, etc.)
2. **Tri** : Par énergie, sucres, ou matières grasses
3. **Ordre** : Ascendant ou descendant
4. **Plages nutritionnelles** :
   - Énergie (min/max en kcal)
   - Sucres (min/max en g)
   - Matières grasses (min/max en g)

**Layout** : Horizontal avec `flex-wrap` pour responsive.

---

## 📊 `components/DataTable.tsx` - Tableau de données

**Rôle** : Affiche les produits dans un tableau avec tri et pagination.

### Fonctionnalités

- ✅ Colonnes : Nom, Marque, Nutri-Score, Éco-Score, Énergie, Sucres, Graisses
- ✅ Tri par colonne (clic sur l'en-tête)
- ✅ Pagination (10 produits par page)
- ✅ Badges colorés pour les scores
- ✅ Lien vers la page détail

---

## 📈 `components/ProductStats.tsx` - Statistiques

**Rôle** : Affiche des statistiques et graphiques sur les produits.

### Graphiques (Recharts)

1. **Comparaison nutritionnelle** : Barres comparant énergie, sucres, graisses
2. **Distribution Nutri-Score** : Camembert (A, B, C, D, E)
3. **Distribution Éco-Score** : Camembert
4. **Top marques** : Barres horizontales
5. **Top pays** : Barres horizontales

### Statistiques calculées

- Moyennes (énergie, sucres, graisses)
- Min/Max pour chaque valeur
- Comptages par score

---

## 🎨 `app/product/[code]/ProductClient.tsx` - Page détail produit

**Rôle** : Affiche les détails complets d'un produit.

### Sections

1. **Image produit** : Grande image centrée
2. **Informations principales** : Nom, marque, quantité, catégories
3. **Scores** : Nutri-Score et Éco-Score avec badges colorés
4. **Informations nutritionnelles** : Énergie, sucres, graisses, sel avec icônes
5. **Alternatives** : Grille de 4 produits similaires

---

## 🔄 Flux de données complet

### 1. Recherche de produits

```
Utilisateur tape dans la barre de recherche
    ↓
page.tsx : useEffect déclenche fetchData() après 300ms
    ↓
lib/api.ts : searchProducts() construit l'URL avec paramètres
    ↓
Requête HTTP GET → http://localhost:8080/api/search?q=...
    ↓
Server.scala : Route /api/search reçoit la requête
    ↓
Server.scala : Appelle api.rawSearch(query)
    ↓
OpenFoodClient.scala : Fait requête HTTP vers OpenFoodFacts
    ↓
OpenFoodClient.scala : Retourne SearchResponse
    ↓
Server.scala : Applique filtres et tri
    ↓
Server.scala : Retourne JSON au frontend
    ↓
page.tsx : Met à jour l'état products
    ↓
page.tsx : Affiche ProductCard pour chaque produit
```

### 2. Détail d'un produit

```
Utilisateur clique sur une carte produit
    ↓
ProductCard.tsx : Lien vers /product/{code}
    ↓
app/product/[code]/page.tsx : Récupère le code depuis l'URL
    ↓
ProductClient.tsx : useEffect déclenche getProduct(code)
    ↓
lib/api.ts : getProduct() fait requête GET
    ↓
Requête HTTP GET → http://localhost:8080/api/product/{code}
    ↓
Server.scala : Route /api/product/{barcode}
    ↓
Server.scala : Appelle api.getProduct(barcode) et api.rawSearch() pour alternatives
    ↓
OpenFoodClient.scala : Récupère produit et alternatives
    ↓
Server.scala : Retourne JSON { product, alternatives }
    ↓
ProductClient.tsx : Affiche les détails et alternatives
```

---

## 🚀 Comment démarrer l'application

### Backend

```bash
cd backend_scala
.\sbt.bat run  # Windows
# ou
sbt run        # Linux/Mac
```

Le serveur démarre sur **http://localhost:8080**

### Frontend

```bash
cd frontend_react
npm install
npm run dev
```

Le frontend démarre sur **http://localhost:3000**

---

## 🔑 Points clés à retenir

### Backend

1. **`Server.scala` est le fichier le plus important** : Il orchestre tout
2. **`OpenFoodClient.scala`** : Fait les requêtes vers OpenFoodFacts
3. **`Models.scala`** : Définit la structure des données
4. **Filtrage et tri** : Se font côté backend pour optimiser les performances
5. **CORS** : Configuré pour permettre les requêtes frontend

### Frontend

1. **`app/page.tsx`** : Point d'entrée principal
2. **`lib/api.ts`** : Communication avec le backend
3. **Composants modulaires** : Chaque composant a une responsabilité unique
4. **3 modes d'affichage** : Grille, Tableau, Statistiques
5. **Debounce** : Évite trop de requêtes lors de la saisie

---

## 🐛 Dépannage

### Backend ne démarre pas

- Vérifier que le port 8080 n'est pas utilisé
- Vérifier que Java 17+ est installé
- Vérifier que sbt est installé

### Frontend ne peut pas contacter le backend

- Vérifier que le backend tourne sur le port 8080
- Vérifier la configuration CORS dans `Server.scala`
- Vérifier l'URL dans `lib/api.ts` (`API_URL = "http://localhost:8080"`)

### Aucun produit trouvé

- Vérifier la connexion internet (OpenFoodFacts nécessite internet)
- Vérifier que les filtres ne sont pas trop restrictifs
- Vérifier les logs du backend pour les erreurs

---

## 📝 Résumé des fichiers par importance

### Backend

1. ⭐ **`Server.scala`** - LE PLUS IMPORTANT (orchestration, routes, logique métier)
2. 🔧 **`OpenFoodClient.scala`** - Important (communication avec OpenFoodFacts)
3. 📦 **`Models.scala`** - Important (structure des données)
4. ⚙️ **`build.sbt`** - Nécessaire (dépendances)

### Frontend

1. ⭐ **`app/page.tsx`** - LE PLUS IMPORTANT (page principale)
2. 🌐 **`lib/api.ts`** - Très important (communication backend)
3. 🎨 **`components/ProductCard.tsx`** - Important (affichage produits)
4. 📦 **`lib/types.ts`** - Important (types TypeScript)
5. 🔍 **`components/SearchFilters.tsx`** - Utile (filtres)
6. 📊 **`components/DataTable.tsx`** - Utile (tableau)
7. 📈 **`components/ProductStats.tsx`** - Utile (statistiques)

---

## 🎓 Concepts techniques utilisés

### Backend (Scala)

- **Cats Effect IO** : Programmation asynchrone et gestion d'erreurs
- **http4s** : Framework HTTP fonctionnel
- **Circe** : Sérialisation/désérialisation JSON
- **Pattern Matching** : Pour le filtrage et le tri
- **Option** : Gestion des valeurs optionnelles
- **Implicits/Givens** : Dérivation automatique d'encodeurs/décodeurs

### Frontend (React/Next.js)

- **React Hooks** : `useState`, `useEffect`, `useCallback`, `useMemo`
- **Next.js App Router** : Routing moderne avec `app/`
- **TypeScript** : Typage statique
- **Tailwind CSS** : Styling utilitaire
- **shadcn/ui** : Composants UI réutilisables
- **Recharts** : Graphiques et visualisations
- **Debounce** : Optimisation des requêtes

---

## 📚 Ressources utiles

- [Documentation Scala 3](https://docs.scala-lang.org/scala3/)
- [Documentation http4s](https://http4s.org/)
- [Documentation Cats Effect](https://typelevel.org/cats-effect/)
- [OpenFoodFacts API](https://world.openfoodfacts.org/data)
- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation React](https://react.dev/)
- [Documentation Recharts](https://recharts.org/)

---

**Documentation créée le :** 2025-01-07
**Version du projet :** 1.0.0
