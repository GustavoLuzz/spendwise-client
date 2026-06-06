import { api } from "@/lib/api"

export type Category = {
  id: string
  name: string
  type: "EXPENSE" | "INCOME"
  isGlobal: boolean
}

export type CreateCategoryPayload = {
  name: string
  type: Category["type"]
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

export async function createCategory(payload: CreateCategoryPayload) {
  const response = await api.post("/categories", payload)
  return response.data as Category
}

export async function updateCategory(
  category: Category,
  payload: CreateCategoryPayload
) {
  let updated = category

  if (payload.name !== category.name) {
    const response = await api.patch(`/categories/${category.id}/name`, null, {
      params: { name: payload.name },
    })
    updated = response.data as Category
  }

  if (payload.type !== category.type) {
    const response = await api.patch(`/categories/${category.id}/type`, null, {
      params: { type: payload.type },
    })
    updated = response.data as Category
  }

  return updated
}

export async function deleteCategory(id: string) {
  await api.delete(`/categories/${id}`)
}
