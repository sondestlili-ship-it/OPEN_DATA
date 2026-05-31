export const nutriscoreColors: Record<string, string> = {
  a: "bg-green-500",
  b: "bg-lime-500",
  c: "bg-yellow-500",
  d: "bg-orange-500",
  e: "bg-red-500",
}

export const ecoscoreColors: Record<string, string> = {
  a: "bg-green-500",
  b: "bg-lime-500",
  c: "bg-yellow-500",
  d: "bg-orange-500",
  e: "bg-red-500",
}

export const novaLabels: Record<number, { label: string; description: string; color: string }> = {
  1: {
    label: "NOVA 1",
    description: "Aliments non transformés ou minimalement transformés",
    color: "bg-green-500",
  },
  2: {
    label: "NOVA 2",
    description: "Ingrédients culinaires transformés",
    color: "bg-lime-500",
  },
  3: {
    label: "NOVA 3",
    description: "Aliments transformés",
    color: "bg-orange-500",
  },
  4: {
    label: "NOVA 4",
    description: "Produits ultra-transformés",
    color: "bg-red-500",
  },
}

export function novaLabel(group: number | null | undefined) {
  if (group == null) return null
  return novaLabels[group] ?? null
}
