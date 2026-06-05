import { api } from "@/lib/api"

export type Category = {
  id: string
  name: string
  type: "EXPENSE" | "INCOME"
}

export async function fetchCategoriesByType(type: "EXPENSE" | "INCOME") {
  const response = await api.get("/categories/type", {
    params: { type },
  })

  return Array.isArray(response.data) ? (response.data as Category[]) : []
}

export async function fetchCategories() {
  const response = await api.get("/categories")
  return Array.isArray(response.data) ? (response.data as Category[]) : []
}
