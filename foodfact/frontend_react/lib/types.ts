export interface Nutriments {
  energy?: number | null
  sugars?: number | null
  salt?: number | null
  fat?: number | null
  proteins?: number | null
  fiber?: number | null
}

export interface Product {
  code: string
  product_name?: string | null
  brands?: string | null
  categories?: string | null
  quantity?: string | null
  nutriscore_grade?: string | null
  ecoscore_grade?: string | null
  nova_group?: number | null
  ingredients_text?: string | null
  allergens?: string | null
  labels?: string | null
  countries?: string | null
  image_url?: string | null
  image_small_url?: string | null
  nutriments?: Nutriments | null
}

export interface SearchResponse {
  count: number
  totalFromOff: number
  page: number
  pageSize: number
  products: Product[]
}

export interface ProductDetailResponse {
  product: Product
  alternatives: Product[]
}

export interface SearchFilters {
  country: string
  brand: string
  sortBy: string
  order: string
  minEnergy: string
  maxEnergy: string
  minSugar: string
  maxSugar: string
  minFat: string
  maxFat: string
  nutriscore: string
  nova: string
}

export interface SearchParams extends Partial<SearchFilters> {
  q?: string
  page?: number
  pageSize?: number
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export const defaultFilters: SearchFilters = {
  country: "",
  brand: "",
  sortBy: "",
  order: "asc",
  minEnergy: "",
  maxEnergy: "",
  minSugar: "",
  maxSugar: "",
  minFat: "",
  maxFat: "",
  nutriscore: "",
  nova: "",
}
