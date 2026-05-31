import type { Product } from "./types"

export interface ProductStats {
  totalProducts: number
  avgEnergy: number
  avgSugar: number
  avgFat: number
  minEnergy: number
  maxEnergy: number
  minSugar: number
  maxSugar: number
  minFat: number
  maxFat: number
  nutriscoreDistribution: Record<string, number>
  ecoscoreDistribution: Record<string, number>
  topBrands: Array<{ brand: string; count: number }>
  topCountries: Array<{ country: string; count: number }>
}

export function calculateStats(products: Product[]): ProductStats {
  const productsWithNutriments = products.filter(
    (p) => p.nutriments && (p.nutriments.energy !== null || p.nutriments.sugars !== null || p.nutriments.fat !== null)
  )

  const energies = productsWithNutriments
    .map((p) => p.nutriments?.energy)
    .filter((e): e is number => e !== null && e !== undefined)
  const sugars = productsWithNutriments
    .map((p) => p.nutriments?.sugars)
    .filter((s): s is number => s !== null && s !== undefined)
  const fats = productsWithNutriments
    .map((p) => p.nutriments?.fat)
    .filter((f): f is number => f !== null && f !== undefined)

  const nutriscoreCount: Record<string, number> = {}
  const ecoscoreCount: Record<string, number> = {}
  const brandCount: Record<string, number> = {}
  const countryCount: Record<string, number> = {}

  products.forEach((product) => {
    if (product.nutriscore_grade) {
      const grade = product.nutriscore_grade.toLowerCase()
      nutriscoreCount[grade] = (nutriscoreCount[grade] || 0) + 1
    }
    if (product.ecoscore_grade) {
      const grade = product.ecoscore_grade.toLowerCase()
      ecoscoreCount[grade] = (ecoscoreCount[grade] || 0) + 1
    }
    if (product.brands) {
      const brands = product.brands.split(",").map((b) => b.trim())
      brands.forEach((brand) => {
        brandCount[brand] = (brandCount[brand] || 0) + 1
      })
    }
    if (product.countries) {
      const countries = product.countries.split(",").map((c) => c.trim())
      countries.forEach((country) => {
        countryCount[country] = (countryCount[country] || 0) + 1
      })
    }
  })

  const topBrands = Object.entries(brandCount)
    .map(([brand, count]) => ({ brand, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const topCountries = Object.entries(countryCount)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  return {
    totalProducts: products.length,
    avgEnergy: energies.length > 0 ? energies.reduce((a, b) => a + b, 0) / energies.length : 0,
    avgSugar: sugars.length > 0 ? sugars.reduce((a, b) => a + b, 0) / sugars.length : 0,
    avgFat: fats.length > 0 ? fats.reduce((a, b) => a + b, 0) / fats.length : 0,
    minEnergy: energies.length > 0 ? Math.min(...energies) : 0,
    maxEnergy: energies.length > 0 ? Math.max(...energies) : 0,
    minSugar: sugars.length > 0 ? Math.min(...sugars) : 0,
    maxSugar: sugars.length > 0 ? Math.max(...sugars) : 0,
    minFat: fats.length > 0 ? Math.min(...fats) : 0,
    maxFat: fats.length > 0 ? Math.max(...fats) : 0,
    nutriscoreDistribution: nutriscoreCount,
    ecoscoreDistribution: ecoscoreCount,
    topBrands,
    topCountries,
  }
}

export type SortField = "product_name" | "brands" | "energy" | "sugars" | "fat" | "nutriscore_grade" | "ecoscore_grade"
export type SortOrder = "asc" | "desc"

export function sortProducts(products: Product[], field: SortField, order: SortOrder): Product[] {
  return [...products].sort((a, b) => {
    let aValue: any
    let bValue: any

    switch (field) {
      case "product_name":
        aValue = a.product_name || ""
        bValue = b.product_name || ""
        break
      case "brands":
        aValue = a.brands || ""
        bValue = b.brands || ""
        break
      case "energy":
        aValue = a.nutriments?.energy ?? 0
        bValue = b.nutriments?.energy ?? 0
        break
      case "sugars":
        aValue = a.nutriments?.sugars ?? 0
        bValue = b.nutriments?.sugars ?? 0
        break
      case "fat":
        aValue = a.nutriments?.fat ?? 0
        bValue = b.nutriments?.fat ?? 0
        break
      case "nutriscore_grade":
        aValue = a.nutriscore_grade || "z"
        bValue = b.nutriscore_grade || "z"
        break
      case "ecoscore_grade":
        aValue = a.ecoscore_grade || "z"
        bValue = b.ecoscore_grade || "z"
        break
      default:
        return 0
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      const comparison = aValue.localeCompare(bValue)
      return order === "asc" ? comparison : -comparison
    }

    const comparison = (aValue as number) - (bValue as number)
    return order === "asc" ? comparison : -comparison
  })
}

