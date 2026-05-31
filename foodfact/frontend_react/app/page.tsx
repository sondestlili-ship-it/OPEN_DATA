"use client"

import type React from "react"
import { useState, useEffect, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, Grid3x3, Table2, BarChart3, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import SearchFilters from "@/components/SearchFilters"
import ProductCard from "@/components/ProductCard"
import ProductStats from "@/components/ProductStats"
import DataTable from "@/components/DataTable"
import ThemeToggle from "@/components/ThemeToggle"
import { searchProducts } from "@/lib/api"
import type { Product, SearchFilters as FilterType } from "@/lib/types"
import { defaultFilters, ApiError } from "@/lib/types"

function filtersFromParams(params: URLSearchParams): FilterType {
  return {
    country: params.get("country") ?? "",
    brand: params.get("brand") ?? "",
    sortBy: params.get("sortBy") ?? "",
    order: params.get("order") ?? "asc",
    minEnergy: params.get("minEnergy") ?? "",
    maxEnergy: params.get("maxEnergy") ?? "",
    minSugar: params.get("minSugar") ?? "",
    maxSugar: params.get("maxSugar") ?? "",
    minFat: params.get("minFat") ?? "",
    maxFat: params.get("maxFat") ?? "",
    nutriscore: params.get("nutriscore") ?? "",
    nova: params.get("nova") ?? "",
  }
}

function hasSearchCriteria(query: string, filters: FilterType): boolean {
  return (
    query.trim().length > 0 ||
    Object.entries(filters).some(([k, v]) => k !== "order" && String(v).trim() !== "")
  )
}

function HomePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState("")
  const [filters, setFilters] = useState<FilterType>(defaultFilters)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [count, setCount] = useState(0)
  const [totalFromOff, setTotalFromOff] = useState(0)
  const [page, setPage] = useState(1)
  const [viewMode, setViewMode] = useState<"grid" | "table" | "stats">("grid")
  const [initialized, setInitialized] = useState(false)

  const syncUrl = useCallback(
    (q: string, f: FilterType, p: number) => {
      const params = new URLSearchParams()
      if (q.trim()) params.set("q", q.trim())
      Object.entries(f).forEach(([key, value]) => {
        if (value && String(value).trim() !== "" && !(key === "order" && value === "asc")) {
          params.set(key, String(value))
        }
      })
      if (p > 1) params.set("page", String(p))
      const qs = params.toString()
      router.replace(qs ? `/?${qs}` : "/", { scroll: false })
    },
    [router]
  )

  useEffect(() => {
    const q = searchParams.get("q") ?? ""
    const f = filtersFromParams(searchParams)
    const p = parseInt(searchParams.get("page") ?? "1", 10)
    setQuery(q)
    setFilters(f)
    setPage(Number.isNaN(p) || p < 1 ? 1 : p)
    setInitialized(true)
  }, [searchParams])

  const fetchData = useCallback(
    async (q: string, f: FilterType, p: number, append: boolean) => {
      if (!hasSearchCriteria(q, f)) {
        setProducts([])
        setCount(0)
        setTotalFromOff(0)
        setError(null)
        return
      }

      if (append) setLoadingMore(true)
      else setLoading(true)
      setError(null)

      try {
        const data = await searchProducts({ q: q.trim() || undefined, ...f, page: p, pageSize: 50 })
        setProducts((prev) => (append ? [...prev, ...(data?.products ?? [])] : data?.products ?? []))
        setCount(data?.count ?? 0)
        setTotalFromOff(data?.totalFromOff ?? 0)
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Impossible de contacter le serveur"
        setError(message)
        if (!append) {
          setProducts([])
          setCount(0)
          setTotalFromOff(0)
        }
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    []
  )

  useEffect(() => {
    if (!initialized) return
    const timer = setTimeout(() => {
      syncUrl(query, filters, page)
      fetchData(query, filters, page, page > 1)
    }, 300)
    return () => clearTimeout(timer)
  }, [query, filters, page, initialized, syncUrl, fetchData])

  function handleResetFilters() {
    setPage(1)
    setProducts([])
    setFilters(defaultFilters)
  }

  function updateFilter(key: keyof FilterType, value: string) {
    setPage(1)
    setProducts([])
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  function handleQueryChange(value: string) {
    setPage(1)
    setProducts([])
    setQuery(value)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    fetchData(query, filters, 1, false)
  }

  function loadMore() {
    const nextPage = page + 1
    setPage(nextPage)
  }

  const canLoadMore = products.length > 0 && products.length < totalFromOff && !loading && !loadingMore
  const showInitial = !hasSearchCriteria(query, filters) && !loading && !error

  return (
    <div className="min-h-screen modern-bg relative">
      <header className="border-b border-border/50 bg-white/80 dark:bg-card/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-2xl">
                💪
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Food Fact</h1>
                <p className="text-xs text-muted-foreground">Des choix alimentaires plus intelligents</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 relative z-10">
        <div className="max-w-4xl mx-auto mb-12 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
            Explorez les <span className="text-primary">Facts Alimentaires</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-6 text-pretty">
            Découvrez les informations nutritionnelles de milliers de produits alimentaires avec des filtres avancés
          </p>

          <div className="mb-8 max-w-6xl mx-auto">
            <SearchFilters filters={filters} onChange={updateFilter} onReset={handleResetFilters} />
          </div>

          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Recherchez des produits, marques ou catégories..."
              className="pl-12 pr-24 h-14 text-lg bg-white/90 dark:bg-card/90 backdrop-blur-sm border-gray-200/80 dark:border-border focus:border-primary focus:ring-primary/20 shadow-sm"
            />
            <Button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 bg-primary hover:bg-primary/90 shadow-md"
            >
              Rechercher
            </Button>
          </form>
        </div>

        <div className="max-w-7xl mx-auto">
          <main className="w-full">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <p className="text-red-700 dark:text-red-300">{error}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchData(query, filters, page, false)}
                  className="shrink-0 gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Réessayer
                </Button>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <p className="text-muted-foreground">Recherche de produits...</p>
                </div>
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                  <p className="text-sm text-muted-foreground">
                    <span className="text-foreground font-semibold">{products.length}</span> produit
                    {products.length > 1 ? "s" : ""} affiché{products.length > 1 ? "s" : ""}
                    {totalFromOff > 0 && (
                      <span>
                        {" "}
                        sur <span className="font-semibold text-foreground">{totalFromOff.toLocaleString()}</span>{" "}
                        trouvés sur OpenFoodFacts
                      </span>
                    )}
                  </p>
                  <div className="flex gap-2 bg-white/90 dark:bg-card/90 backdrop-blur-sm rounded-xl p-1 border border-gray-200 dark:border-border shadow-sm">
                    {(["grid", "table", "stats"] as const).map((mode) => (
                      <Button
                        key={mode}
                        variant={viewMode === mode ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode(mode)}
                        className="h-9 px-4 rounded-lg"
                      >
                        {mode === "grid" && <Grid3x3 className="w-4 h-4 mr-2" />}
                        {mode === "table" && <Table2 className="w-4 h-4 mr-2" />}
                        {mode === "stats" && <BarChart3 className="w-4 h-4 mr-2" />}
                        {mode === "grid" ? "Grille" : mode === "table" ? "Tableau" : "Statistiques"}
                      </Button>
                    ))}
                  </div>
                </div>

                {viewMode === "grid" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <ProductCard key={product.code} product={product} />
                    ))}
                  </div>
                )}
                {viewMode === "table" && <DataTable products={products} />}
                {viewMode === "stats" && <ProductStats products={products} />}

                {canLoadMore && (
                  <div className="flex justify-center mt-8">
                    <Button onClick={loadMore} disabled={loadingMore} variant="outline" className="gap-2">
                      {loadingMore ? (
                        <>
                          <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                          Chargement...
                        </>
                      ) : (
                        "Charger plus de produits"
                      )}
                    </Button>
                  </div>
                )}
              </>
            ) : showInitial ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-4xl">
                  💪
                </div>
                <h3 className="text-xl font-semibold mb-2">Commencez votre recherche</h3>
                <p className="text-muted-foreground">
                  Entrez un nom de produit ou utilisez les filtres pour commencer
                </p>
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Aucun produit trouvé</h3>
                <p className="text-muted-foreground">Essayez d&apos;ajuster votre recherche ou vos filtres</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen modern-bg flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  )
}
