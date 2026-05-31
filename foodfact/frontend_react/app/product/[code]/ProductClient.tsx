"use client"

import { useEffect, useState } from "react"
import { getProduct } from "@/lib/api"
import type { ProductDetailResponse } from "@/lib/types"
import { ApiError } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Leaf,
  Zap,
  Candy,
  Droplet,
  AlertCircle,
  Award,
  Circle,
  ExternalLink,
  FlaskConical,
} from "lucide-react"
import Link from "next/link"
import ProductCard from "@/components/ProductCard"
import ThemeToggle from "@/components/ThemeToggle"
import { nutriscoreColors, ecoscoreColors, novaLabel } from "@/lib/scoreColors"

export default function ProductClient({ code }: { code: string }) {
  const [data, setData] = useState<ProductDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const result = await getProduct(code)
        setData(result)
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Impossible de charger le produit"
        setError(message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [code])

  if (loading) {
    return (
      <div className="min-h-screen modern-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium">Chargement du produit...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen modern-bg flex items-center justify-center">
        <div className="text-center bg-white/90 dark:bg-card/90 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 dark:border-border shadow-lg">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Produit introuvable</h2>
          <p className="text-muted-foreground mb-6">{error ?? "Impossible de charger les détails du produit"}</p>
          <Link href="/">
            <Button className="bg-primary hover:bg-primary/90">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à la recherche
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const { product, alternatives } = data
  const nova = novaLabel(product.nova_group)
  const offUrl = `https://world.openfoodfacts.org/product/${product.code}`

  return (
    <div className="min-h-screen modern-bg relative">
      <header className="bg-white/80 dark:bg-card/80 backdrop-blur-md border-b border-gray-200/50 dark:border-border sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à la recherche
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white/90 dark:bg-card/90 backdrop-blur-sm border-2 border-gray-200 dark:border-border rounded-3xl p-8 flex items-center justify-center aspect-square shadow-lg">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.product_name || "Produit"}
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center gap-4 text-muted-foreground">
                  <Award className="w-24 h-24" />
                  <p>Aucune image disponible</p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-3">{product.product_name || "Produit sans nom"}</h1>
                {product.brands && <p className="text-lg text-primary font-semibold">{product.brands}</p>}
              </div>

              <div className="flex flex-wrap gap-3">
                {product.quantity && (
                  <Badge className="text-sm px-4 py-2 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-300/50 rounded-full">
                    {product.quantity}
                  </Badge>
                )}
                {product.categories && (
                  <Badge variant="outline" className="text-sm px-4 py-2 rounded-full">
                    {product.categories.split(",").slice(0, 2).join(", ")}
                  </Badge>
                )}
                {product.labels && product.labels.split(",").slice(0, 3).map((label) => (
                  <Badge key={label} variant="secondary" className="rounded-full text-xs">
                    {label.trim()}
                  </Badge>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <a href={offUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Voir sur OpenFoodFacts
                  </Button>
                </a>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {product.nutriscore_grade && (
                  <Card className="bg-white/90 dark:bg-card/90 border-2 border-gray-200 dark:border-border shadow-lg">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-16 h-16 rounded-xl ${
                            nutriscoreColors[product.nutriscore_grade.toLowerCase()] || "bg-gray-500"
                          } flex items-center justify-center shadow-xl`}
                        >
                          <span className="text-2xl font-bold text-white uppercase">
                            {product.nutriscore_grade}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-medium uppercase mb-1">Nutri-Score</p>
                          <p className="font-bold">Qualité nutritionnelle</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {product.ecoscore_grade && (
                  <Card className="bg-white/90 dark:bg-card/90 border-2 border-gray-200 dark:border-border shadow-lg">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-16 h-16 rounded-xl ${
                            ecoscoreColors[product.ecoscore_grade.toLowerCase()] || "bg-gray-500"
                          } flex items-center justify-center shadow-xl`}
                        >
                          <Leaf className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-medium uppercase mb-1">Éco-Score</p>
                          <p className="font-bold">Impact environnemental</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {nova && (
                  <Card className="bg-white/90 dark:bg-card/90 border-2 border-gray-200 dark:border-border shadow-lg col-span-2">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-xl ${nova.color} flex items-center justify-center shadow-xl`}>
                          <FlaskConical className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-medium uppercase mb-1">{nova.label}</p>
                          <p className="font-bold">{nova.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {product.nutriments && (
                <Card className="bg-white/90 dark:bg-card/90 border-2 border-gray-200 dark:border-border shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-6">
                      Informations nutritionnelles
                      <span className="text-sm text-muted-foreground font-normal ml-2">(pour 100g)</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {product.nutriments.energy != null && (
                        <div className="flex items-center gap-4 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
                          <Zap className="w-6 h-6 text-amber-600" />
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Énergie</p>
                            <p className="font-mono font-bold text-xl">{product.nutriments.energy} kcal</p>
                          </div>
                        </div>
                      )}
                      {product.nutriments.sugars != null && (
                        <div className="flex items-center gap-4 p-4 bg-pink-50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-800 rounded-xl">
                          <Candy className="w-6 h-6 text-pink-600" />
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Sucres</p>
                            <p className="font-mono font-bold text-xl">{product.nutriments.sugars}g</p>
                          </div>
                        </div>
                      )}
                      {product.nutriments.fat != null && (
                        <div className="flex items-center gap-4 p-4 bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 rounded-xl">
                          <Droplet className="w-6 h-6 text-cyan-600" />
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Matières grasses</p>
                            <p className="font-mono font-bold text-xl">{product.nutriments.fat}g</p>
                          </div>
                        </div>
                      )}
                      {product.nutriments.salt != null && (
                        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-xl">
                          <Circle className="w-6 h-6 text-gray-600" />
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Sel</p>
                            <p className="font-mono font-bold text-xl">{product.nutriments.salt}g</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {product.ingredients_text && (
                <Card className="bg-white/90 dark:bg-card/90 border-2 border-gray-200 dark:border-border shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4">Ingrédients</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{product.ingredients_text}</p>
                  </CardContent>
                </Card>
              )}

              {product.allergens && (
                <Card className="bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-800 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-700 dark:text-red-300">
                      <AlertCircle className="w-5 h-5" />
                      Allergènes
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {product.allergens.split(",").map((allergen) => (
                        <Badge
                          key={allergen}
                          className="bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700"
                        >
                          {allergen.trim().replace(/^en:/, "")}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {alternatives && alternatives.length > 0 && (
            <div>
              <div className="mb-6">
                <h2 className="text-3xl font-bold mb-2">Alternatives plus saines</h2>
                <p className="text-muted-foreground">Produits similaires triés par Nutri-Score</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {alternatives.map((alt) => (
                  <ProductCard key={alt.code} product={alt} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
