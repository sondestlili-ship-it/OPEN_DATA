"use client"

import { useState, useMemo } from "react"
import type { Product } from "@/lib/types"
import { sortProducts, type SortField, type SortOrder } from "@/lib/dataUtils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Leaf } from "lucide-react"

interface DataTableProps {
  products: Product[]
  pageSize?: number
}

import { nutriscoreColors, ecoscoreColors } from "@/lib/scoreColors"

export default function DataTable({ products, pageSize = 20 }: DataTableProps) {
  const [sortField, setSortField] = useState<SortField>("product_name")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
  const [currentPage, setCurrentPage] = useState(1)

  const sortedProducts = useMemo(() => {
    return sortProducts(products, sortField, sortOrder)
  }, [products, sortField, sortOrder])

  const totalPages = Math.ceil(sortedProducts.length / pageSize)
  const paginatedProducts = sortedProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
    setCurrentPage(1)
  }

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => {
    const isActive = sortField === field
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleSort(field)}
        className={`h-8 px-2 font-semibold text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors ${
          isActive ? "text-primary bg-primary/10" : ""
        }`}
      >
        {children}
        {isActive ? (
          sortOrder === "asc" ? (
            <ArrowUp className="w-3 h-3 ml-1 text-primary" />
          ) : (
            <ArrowDown className="w-3 h-3 ml-1 text-primary" />
          )
        ) : (
          <ArrowUpDown className="w-3 h-3 ml-1 opacity-40" />
        )}
      </Button>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="bg-white/90 backdrop-blur-sm border-gray-200/80 shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-b-2 border-primary/20">
                  <th className="text-left p-4">
                    <SortButton field="product_name">Produit</SortButton>
                  </th>
                  <th className="text-left p-4">
                    <SortButton field="brands">Marque</SortButton>
                  </th>
                  <th className="text-left p-4">
                    <SortButton field="energy">Énergie (kcal)</SortButton>
                  </th>
                  <th className="text-left p-4">
                    <SortButton field="sugars">Sucres (g)</SortButton>
                  </th>
                  <th className="text-left p-4">
                    <SortButton field="fat">Graisses (g)</SortButton>
                  </th>
                  <th className="text-left p-4">
                    <SortButton field="nutriscore_grade">Nutri-Score</SortButton>
                  </th>
                  <th className="text-left p-4">
                    <SortButton field="ecoscore_grade">Éco-Score</SortButton>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((product, index) => (
                  <tr
                    key={product.code}
                    className={`border-b border-gray-100 transition-colors ${
                      index % 2 === 0 
                        ? "bg-white hover:bg-gray-50" 
                        : "bg-gray-50/50 hover:bg-gray-100"
                    }`}
                  >
                    <td className="p-4">
                      <Link
                        href={`/product/${product.code}`}
                        className="font-semibold text-gray-900 hover:text-primary transition-colors"
                      >
                        {product.product_name || "Sans nom"}
                      </Link>
                    </td>
                    <td className="p-4 text-sm text-gray-700">
                      {product.brands || "-"}
                    </td>
                    <td className="p-4 text-sm font-mono font-semibold text-gray-900">
                      {product.nutriments?.energy !== null && product.nutriments?.energy !== undefined 
                        ? product.nutriments.energy 
                        : "-"}
                    </td>
                    <td className="p-4 text-sm font-mono font-semibold text-gray-900">
                      {product.nutriments?.sugars !== null && product.nutriments?.sugars !== undefined 
                        ? product.nutriments.sugars 
                        : "-"}
                    </td>
                    <td className="p-4 text-sm font-mono font-semibold text-gray-900">
                      {product.nutriments?.fat !== null && product.nutriments?.fat !== undefined 
                        ? product.nutriments.fat 
                        : "-"}
                    </td>
                    <td className="p-4">
                      {product.nutriscore_grade ? (
                        <span
                          className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${
                            nutriscoreColors[product.nutriscore_grade.toLowerCase()] || "bg-gray-500"
                          } text-white text-sm font-bold uppercase shadow-md border-2 border-white/30`}
                        >
                          {product.nutriscore_grade}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      {product.ecoscore_grade ? (
                        <span
                          className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${
                            ecoscoreColors[product.ecoscore_grade.toLowerCase()] || "bg-gray-500"
                          } text-white text-sm font-bold uppercase shadow-md border-2 border-white/30`}
                        >
                          {product.ecoscore_grade === "NOT-APPLICABLE" ? (
                            <span className="text-[8px]">N/A</span>
                          ) : (
                            <Leaf className="w-5 h-5" />
                          )}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 border-t-2 border-gray-200">
              <div className="text-sm text-gray-600 font-medium">
                Page <span className="font-bold text-gray-900">{currentPage}</span> sur{" "}
                <span className="font-bold text-gray-900">{totalPages}</span> (
                <span className="font-bold text-primary">{sortedProducts.length}</span> produits)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="border-gray-300 hover:bg-primary hover:text-white hover:border-primary transition-colors disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="border-gray-300 hover:bg-primary hover:text-white hover:border-primary transition-colors disabled:opacity-50"
                >
                  Suivant
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
