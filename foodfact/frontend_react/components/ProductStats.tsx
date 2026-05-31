"use client"

import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from "recharts"
import type { Product } from "@/lib/types"
import { calculateStats, type ProductStats as Stats } from "@/lib/dataUtils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, TrendingDown, Award, Globe, Tag, Zap, Candy, Droplet, Activity } from "lucide-react"

interface ProductStatsProps {
  products: Product[]
}

const COLORS = {
  primary: "#8BC34A",
  emerald: "#10B981",
  green: "#22C55E",
  amber: "#F59E0B",
  pink: "#EC4899",
  cyan: "#06B6D4",
  blue: "#3B82F6",
  purple: "#8B5CF6",
}

const nutriscoreColors: Record<string, string> = {
  a: COLORS.green,
  b: COLORS.emerald,
  c: COLORS.amber,
  d: "#F97316",
  e: "#EF4444",
}

export default function ProductStats({ products }: ProductStatsProps) {
  const stats = useMemo(() => calculateStats(products), [products])

  // Préparer les données pour les graphiques
  const nutriscoreData = useMemo(() => {
    return Object.entries(stats.nutriscoreDistribution)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([grade, count]) => ({
        name: grade.toUpperCase(),
        value: count,
        fill: nutriscoreColors[grade] || COLORS.primary,
      }))
  }, [stats.nutriscoreDistribution])

  const ecoscoreData = useMemo(() => {
    return Object.entries(stats.ecoscoreDistribution)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([grade, count]) => ({
        name: grade.toUpperCase(),
        value: count,
        fill: nutriscoreColors[grade] || COLORS.primary,
      }))
  }, [stats.ecoscoreDistribution])

  const topBrandsData = useMemo(() => {
    return stats.topBrands.slice(0, 8).map(({ brand, count }) => ({
      name: brand.length > 15 ? brand.substring(0, 15) + "..." : brand,
      fullName: brand,
      value: count,
    }))
  }, [stats.topBrands])

  const topCountriesData = useMemo(() => {
    return stats.topCountries.slice(0, 8).map(({ country, count }) => ({
      name: country,
      value: count,
    }))
  }, [stats.topCountries])

  const nutritionComparison = useMemo(() => {
    return [
      {
        name: "Énergie",
        moyenne: stats.avgEnergy,
        min: stats.minEnergy,
        max: stats.maxEnergy,
      },
      {
        name: "Sucres",
        moyenne: stats.avgSugar,
        min: stats.minSugar,
        max: stats.maxSugar,
      },
      {
        name: "Graisses",
        moyenne: stats.avgFat,
        min: stats.minFat,
        max: stats.maxFat,
      },
    ]
  }, [stats])

  return (
    <div className="space-y-6">
      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Produits</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Activity className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Énergie Moyenne</p>
                <p className="text-3xl font-bold text-gray-900">{Math.round(stats.avgEnergy)}</p>
                <p className="text-xs text-gray-500 mt-1">kcal/100g</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Sucres Moyens</p>
                <p className="text-3xl font-bold text-gray-900">{stats.avgSugar.toFixed(1)}</p>
                <p className="text-xs text-gray-500 mt-1">g/100g</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center">
                <Candy className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Graisses Moyennes</p>
                <p className="text-3xl font-bold text-gray-900">{stats.avgFat.toFixed(1)}</p>
                <p className="text-xs text-gray-500 mt-1">g/100g</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <Droplet className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphique de comparaison nutritionnelle */}
      <Card className="bg-white/90 backdrop-blur-sm border-gray-200/80 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Comparaison Nutritionnelle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={nutritionComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="moyenne" fill={COLORS.primary} name="Moyenne" radius={[8, 8, 0, 0]} />
              <Bar dataKey="min" fill={COLORS.amber} name="Minimum" radius={[8, 8, 0, 0]} />
              <Bar dataKey="max" fill={COLORS.pink} name="Maximum" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution Nutri-Score */}
        {nutriscoreData.length > 0 && (
          <Card className="bg-white/90 backdrop-blur-sm border-gray-200/80 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Distribution Nutri-Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={nutriscoreData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {nutriscoreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Distribution Eco-Score */}
        {ecoscoreData.length > 0 && (
          <Card className="bg-white/90 backdrop-blur-sm border-gray-200/80 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Distribution Eco-Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ecoscoreData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {ecoscoreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Marques */}
        {topBrandsData.length > 0 && (
          <Card className="bg-white/90 backdrop-blur-sm border-gray-200/80 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" />
                Top Marques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topBrandsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#6b7280" />
                  <YAxis dataKey="name" type="category" stroke="#6b7280" width={120} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                    formatter={(value, name, props) => [
                      `${value ?? 0} produits`,
                      (props as { payload?: { fullName?: string } }).payload?.fullName || name,
                    ]}
                  />
                  <Bar dataKey="value" fill={COLORS.primary} radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Top Pays */}
        {topCountriesData.length > 0 && (
          <Card className="bg-white/90 backdrop-blur-sm border-gray-200/80 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Top Pays
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topCountriesData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#6b7280" />
                  <YAxis dataKey="name" type="category" stroke="#6b7280" width={120} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                    formatter={(value) => `${value ?? 0} produits`}
                  />
                  <Bar dataKey="value" fill={COLORS.cyan} radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Plages de valeurs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold text-gray-900">Plage d'Énergie</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Min</span>
                <span className="text-lg font-bold text-gray-900">{stats.minEnergy} kcal</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Max</span>
                <span className="text-lg font-bold text-gray-900">{stats.maxEnergy} kcal</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-pink-600" />
              <h3 className="font-semibold text-gray-900">Plage de Sucres</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Min</span>
                <span className="text-lg font-bold text-gray-900">{stats.minSugar.toFixed(1)}g</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Max</span>
                <span className="text-lg font-bold text-gray-900">{stats.maxSugar.toFixed(1)}g</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-cyan-600" />
              <h3 className="font-semibold text-gray-900">Plage de Graisses</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Min</span>
                <span className="text-lg font-bold text-gray-900">{stats.minFat.toFixed(1)}g</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Max</span>
                <span className="text-lg font-bold text-gray-900">{stats.maxFat.toFixed(1)}g</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
