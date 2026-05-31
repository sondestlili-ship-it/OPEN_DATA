import type { SearchResponse, ProductDetailResponse, SearchParams } from "./types"
import { ApiError } from "./types"

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `API Error (${res.status})`
    try {
      const body = await res.json()
      if (body?.error) message = body.error
    } catch {
      // ignore parse errors
    }
    throw new ApiError(message, res.status)
  }
  return res.json()
}

export async function searchProducts(params: SearchParams): Promise<SearchResponse> {
  const entries = Object.entries(params).filter(([k, v]) => {
    if (v === undefined || v === null) return false
    if (k === "page") return Number(v) > 1
    if (k === "pageSize") return String(v).trim() !== ""
    return String(v).trim() !== ""
  })

  const qs = new URLSearchParams(
    entries.map(([k, v]) => [k, String(v)])
  )
  const url = `${API_URL}/api/search?${qs.toString()}`
  const res = await fetch(url)
  return handleResponse<SearchResponse>(res)
}

export async function getProduct(code: string): Promise<ProductDetailResponse> {
  const res = await fetch(`${API_URL}/api/product/${code}`)
  return handleResponse<ProductDetailResponse>(res)
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/health`)
    return res.ok
  } catch {
    return false
  }
}
