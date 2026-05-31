"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Leaf, Zap, Award } from "lucide-react"
import type { Product } from "@/lib/types"
import { nutriscoreColors, ecoscoreColors, novaLabel } from "@/lib/scoreColors"

interface ProductCardProps {
  product: Product
}

// Gradients NFT verts modernes pour chaque carte
const nftGradients = [
  "from-emerald-500/30 via-green-500/20 to-teal-500/30",
  "from-green-500/30 via-emerald-500/20 to-lime-500/30",
  "from-teal-500/30 via-cyan-500/20 to-green-500/30",
  "from-lime-500/30 via-green-500/20 to-emerald-500/30",
  "from-cyan-500/30 via-teal-500/20 to-green-500/30",
  "from-emerald-600/30 via-green-600/20 to-teal-600/30",
  "from-green-400/30 via-emerald-400/20 to-lime-400/30",
  "from-teal-400/30 via-cyan-400/20 to-green-400/30",
]

const borderGlows = [
  "border-emerald-400/60",
  "border-green-400/60",
  "border-teal-400/60",
  "border-lime-400/60",
  "border-cyan-400/60",
  "border-emerald-500/60",
  "border-green-500/60",
  "border-teal-500/60",
]

export default function ProductCard({ product }: ProductCardProps) {
  const [imgError, setImgError] = useState(false)

  const nutriscoreColorsLocal = nutriscoreColors
  const ecoscoreColorsLocal = ecoscoreColors
  const nova = novaLabel(product.nova_group)

  // Générer un index basé sur le code produit pour varier les couleurs NFT
  const cardIndex = useMemo(() => {
    if (!product.code) return 0
    const hash = product.code.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return hash % nftGradients.length
  }, [product.code])

  const gradient = nftGradients[cardIndex]
  const borderGlow = borderGlows[cardIndex]

  // Générer des positions aléatoires pour les particules NFT
  const particles = useMemo(() => {
    return Array.from({ length: 4 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 4,
      size: 20 + Math.random() * 30,
    }))
  }, [])

  return (
    <Link href={`/product/${product.code}`}>
      <div className="group relative card-3d">
        {/* Carte NFT verte moderne */}
        <Card className={`group overflow-hidden bg-gradient-to-br ${gradient} border-2 ${borderGlow} hover:border-emerald-400 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/20 cursor-pointer h-full rounded-3xl`}>
          {/* Bordure néon animée au hover */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-400/40 via-green-400/40 to-teal-400/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10" />
          
          {/* Effets de particules NFT vertes animées */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
            {particles.map((particle) => (
              <div
                key={particle.id}
                className="absolute rounded-full bg-gradient-to-br from-emerald-400/30 to-green-400/30 blur-md"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  animation: `nft-float ${3 + particle.delay}s ease-in-out infinite`,
                  animationDelay: `${particle.delay}s`,
                }}
              />
            ))}
          </div>

          {/* Contenu de la carte avec glassmorphism */}
          <div className="relative z-10 bg-white/90 backdrop-blur-md">
            {/* Product Image avec fond NFT */}
            <div className="aspect-square bg-gradient-to-br from-emerald-50/50 via-green-50/30 to-teal-50/50 relative overflow-hidden rounded-t-3xl">
              {!imgError && (product.image_small_url || product.image_url) ? (
                <div className="relative w-full h-full">
                  <img
                    src={product.image_small_url || product.image_url || ""}
                    alt={product.product_name || "Produit"}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 p-4"
                    onError={() => setImgError(true)}
                    loading="lazy"
                  />
                  {/* Overlay gradient vert au hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100/50 to-green-100/50">
                  <Award className="w-12 h-12 text-emerald-400/50" />
                </div>
              )}

              {/* Badges scores avec effet néon vert NFT */}
              <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
                {product.nutriscore_grade && (
                  <div className="relative">
                    <div className={`absolute inset-0 ${nutriscoreColorsLocal[product.nutriscore_grade.toLowerCase()] || "bg-gray-500"} rounded-xl blur-md opacity-75 group-hover:opacity-100 transition-opacity`} />
                    <div
                      className={`relative w-11 h-11 rounded-xl ${
                        nutriscoreColorsLocal[product.nutriscore_grade.toLowerCase()] || "bg-gray-500"
                      } flex items-center justify-center shadow-xl border-2 border-white/30 backdrop-blur-sm`}
                    >
                      <span className="text-lg font-bold text-white uppercase drop-shadow-lg">
                        {product.nutriscore_grade}
                      </span>
                    </div>
                  </div>
                )}
                {product.ecoscore_grade && (
                  <div className="relative">
                    <div className={`absolute inset-0 ${ecoscoreColorsLocal[product.ecoscore_grade.toLowerCase()] || "bg-gray-500"} rounded-xl blur-md opacity-75 group-hover:opacity-100 transition-opacity`} />
                    <div
                      className={`relative w-11 h-11 rounded-xl ${
                        ecoscoreColorsLocal[product.ecoscore_grade.toLowerCase()] || "bg-gray-500"
                      } flex items-center justify-center shadow-xl border-2 border-white/30 backdrop-blur-sm`}
                    >
                      <Leaf className="w-5 h-5 text-white drop-shadow-lg" />
                    </div>
                  </div>
                )}
                {nova && (
                  <div className="relative">
                    <div className={`absolute inset-0 ${nova.color} rounded-xl blur-md opacity-75`} />
                    <div className={`relative px-2 h-11 rounded-xl ${nova.color} flex items-center justify-center shadow-xl border-2 border-white/30`}>
                      <span className="text-[10px] font-bold text-white">{nova.label}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Informations produit avec style NFT vert */}
            <CardContent className="p-5 bg-gradient-to-b from-white/95 to-emerald-50/30 backdrop-blur-sm">
              <h3 className="font-bold text-sm mb-1.5 line-clamp-2 group-hover:text-emerald-600 transition-colors text-gray-900 drop-shadow-sm">
                {product.product_name || "Produit sans nom"}
              </h3>

              {product.brands && <p className="text-xs text-emerald-600 font-medium mb-3 drop-shadow-sm">{product.brands}</p>}

              {product.quantity && (
                <Badge variant="secondary" className="mb-3 text-xs bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-300/50 rounded-full shadow-sm">
                  {product.quantity}
                </Badge>
              )}

              {/* Nutrition highlights avec style NFT */}
              {product.nutriments && (
                <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-emerald-200/50">
                  {product.nutriments.energy !== null && product.nutriments.energy !== undefined && (
                    <div className="text-center p-2 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 group-hover:border-amber-300 transition-colors shadow-sm">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Zap className="w-3.5 h-3.5 text-amber-600" />
                      </div>
                      <p className="text-xs font-mono font-bold text-gray-900">{product.nutriments.energy}</p>
                      <p className="text-[10px] text-gray-600">kcal</p>
                    </div>
                  )}
                  {product.nutriments.sugars !== null && product.nutriments.sugars !== undefined && (
                    <div className="text-center p-2 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200/50 group-hover:border-pink-300 transition-colors shadow-sm">
                      <p className="text-[10px] text-gray-600 mb-1 font-medium">Sucres</p>
                      <p className="text-xs font-mono font-bold text-gray-900">{product.nutriments.sugars}g</p>
                    </div>
                  )}
                  {product.nutriments.fat !== null && product.nutriments.fat !== undefined && (
                    <div className="text-center p-2 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200/50 group-hover:border-cyan-300 transition-colors shadow-sm">
                      <p className="text-[10px] text-gray-600 mb-1 font-medium">Graisse</p>
                      <p className="text-xs font-mono font-bold text-gray-900">{product.nutriments.fat}g</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </div>
        </Card>
      </div>
    </Link>
  )
}
