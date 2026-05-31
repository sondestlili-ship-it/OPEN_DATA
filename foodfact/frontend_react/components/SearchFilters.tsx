"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Globe, Zap, Candy, Droplet, ArrowUpDown, Tag, RotateCcw } from "lucide-react"
import type { SearchFilters as FilterType } from "@/lib/types"
import { defaultFilters } from "@/lib/types"

interface SearchFiltersProps {
  filters: FilterType
  onChange: (key: keyof FilterType, value: string) => void
  onReset: () => void
}

const countries = [
  { value: "", label: "Tous les pays" },
  { value: "France", label: "🇫🇷 France" },
  { value: "Belgique", label: "🇧🇪 Belgique" },
  { value: "Suisse", label: "🇨🇭 Suisse" },
  { value: "Canada", label: "🇨🇦 Canada" },
  { value: "Espagne", label: "🇪🇸 Espagne" },
  { value: "Italie", label: "🇮🇹 Italie" },
  { value: "Allemagne", label: "🇩🇪 Allemagne" },
  { value: "Maroc", label: "🇲🇦 Maroc" },
  { value: "Tunisie", label: "🇹🇳 Tunisie" },
  { value: "Algérie", label: "🇩🇿 Algérie" },
  { value: "États-Unis", label: "🇺🇸 États-Unis" },
  { value: "Royaume-Uni", label: "🇬🇧 Royaume-Uni" },
]

const nutriscoreOptions = ["a", "b", "c", "d", "e"]
const novaOptions = ["1", "2", "3", "4"]

const selectClass =
  "w-full bg-white dark:bg-card border border-gray-200 dark:border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"

export default function SearchFilters({ filters, onChange, onReset }: SearchFiltersProps) {
  const selectedNutriscores = filters.nutriscore ? filters.nutriscore.split(",").filter(Boolean) : []
  const selectedNova = filters.nova ? filters.nova.split(",").filter(Boolean) : []

  function toggleNutriscore(grade: string) {
    const next = selectedNutriscores.includes(grade)
      ? selectedNutriscores.filter((g) => g !== grade)
      : [...selectedNutriscores, grade]
    onChange("nutriscore", next.join(","))
  }

  function toggleNova(group: string) {
    const next = selectedNova.includes(group)
      ? selectedNova.filter((g) => g !== group)
      : [...selectedNova, group]
    onChange("nova", next.join(","))
  }

  const hasFilters = JSON.stringify(filters) !== JSON.stringify(defaultFilters)

  return (
    <div className="w-full bg-white/90 dark:bg-card/90 backdrop-blur-sm border border-gray-200/80 dark:border-border rounded-xl shadow-sm p-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[180px]">
          <Label htmlFor="brand" className="text-sm font-medium mb-2 flex items-center gap-2">
            <Tag className="w-4 h-4 text-primary" />
            Marque
          </Label>
          <Input
            id="brand"
            value={filters.brand}
            onChange={(e) => onChange("brand", e.target.value)}
            placeholder="Ex: Nestlé, Danone..."
            className="bg-white dark:bg-card border-gray-200 dark:border-border focus:border-primary focus:ring-primary/20 text-sm"
          />
        </div>

        <div className="flex-1 min-w-[180px]">
          <Label htmlFor="country" className="text-sm font-medium mb-2 flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            Pays
          </Label>
          <select
            id="country"
            value={filters.country}
            onChange={(e) => onChange("country", e.target.value)}
            className={selectClass}
          >
            {countries.map((country) => (
              <option key={country.value} value={country.value}>
                {country.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[160px]">
          <Label htmlFor="sortBy" className="text-sm font-medium mb-2 flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-primary" />
            Trier par
          </Label>
          <select
            id="sortBy"
            value={filters.sortBy}
            onChange={(e) => onChange("sortBy", e.target.value)}
            className={selectClass}
          >
            <option value="">Aucun</option>
            <option value="energy">Énergie</option>
            <option value="sugars">Sucres</option>
            <option value="fat">Matières grasses</option>
            <option value="nutriscore">Nutri-Score</option>
          </select>
        </div>

        {filters.sortBy && (
          <div className="flex-1 min-w-[130px]">
            <Label htmlFor="order" className="text-sm font-medium mb-2">
              Ordre
            </Label>
            <select
              id="order"
              value={filters.order}
              onChange={(e) => onChange("order", e.target.value)}
              className={selectClass}
            >
              <option value="asc">Croissant</option>
              <option value="desc">Décroissant</option>
            </select>
          </div>
        )}

        <div className="flex-1 min-w-[180px]">
          <Label className="text-sm font-medium mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Énergie (kcal)
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              id="minEnergy"
              type="number"
              value={filters.minEnergy}
              onChange={(e) => onChange("minEnergy", e.target.value)}
              placeholder="Min"
              className="bg-white dark:bg-card border-gray-200 dark:border-border text-sm"
            />
            <Input
              id="maxEnergy"
              type="number"
              value={filters.maxEnergy}
              onChange={(e) => onChange("maxEnergy", e.target.value)}
              placeholder="Max"
              className="bg-white dark:bg-card border-gray-200 dark:border-border text-sm"
            />
          </div>
        </div>

        <div className="flex-1 min-w-[180px]">
          <Label className="text-sm font-medium mb-2 flex items-center gap-2">
            <Candy className="w-4 h-4 text-primary" />
            Sucres (g)
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              value={filters.minSugar}
              onChange={(e) => onChange("minSugar", e.target.value)}
              placeholder="Min"
              className="bg-white dark:bg-card border-gray-200 dark:border-border text-sm"
            />
            <Input
              type="number"
              value={filters.maxSugar}
              onChange={(e) => onChange("maxSugar", e.target.value)}
              placeholder="Max"
              className="bg-white dark:bg-card border-gray-200 dark:border-border text-sm"
            />
          </div>
        </div>

        <div className="flex-1 min-w-[180px]">
          <Label className="text-sm font-medium mb-2 flex items-center gap-2">
            <Droplet className="w-4 h-4 text-primary" />
            Graisses (g)
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              value={filters.minFat}
              onChange={(e) => onChange("minFat", e.target.value)}
              placeholder="Min"
              className="bg-white dark:bg-card border-gray-200 dark:border-border text-sm"
            />
            <Input
              type="number"
              value={filters.maxFat}
              onChange={(e) => onChange("maxFat", e.target.value)}
              placeholder="Max"
              className="bg-white dark:bg-card border-gray-200 dark:border-border text-sm"
            />
          </div>
        </div>

        <div className="w-full">
          <Label className="text-sm font-medium mb-2 block">Nutri-Score</Label>
          <div className="flex flex-wrap gap-2">
            {nutriscoreOptions.map((grade) => (
              <button
                key={grade}
                type="button"
                onClick={() => toggleNutriscore(grade)}
                className={`w-9 h-9 rounded-lg font-bold uppercase text-white text-sm transition-all ${
                  selectedNutriscores.includes(grade)
                    ? "ring-2 ring-primary ring-offset-2 scale-110"
                    : "opacity-60 hover:opacity-100"
                } ${
                  grade === "a"
                    ? "bg-green-500"
                    : grade === "b"
                      ? "bg-lime-500"
                      : grade === "c"
                        ? "bg-yellow-500"
                        : grade === "d"
                          ? "bg-orange-500"
                          : "bg-red-500"
                }`}
              >
                {grade}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full">
          <Label className="text-sm font-medium mb-2 block">NOVA</Label>
          <div className="flex flex-wrap gap-2">
            {novaOptions.map((group) => (
              <button
                key={group}
                type="button"
                onClick={() => toggleNova(group)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                  selectedNova.includes(group)
                    ? "bg-primary text-white border-primary"
                    : "bg-white dark:bg-card border-gray-200 dark:border-border hover:border-primary"
                }`}
              >
                Groupe {group}
              </button>
            ))}
          </div>
        </div>

        {hasFilters && (
          <Button type="button" variant="outline" size="sm" onClick={onReset} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Réinitialiser
          </Button>
        )}
      </div>
    </div>
  )
}
