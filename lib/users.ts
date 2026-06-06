import { api } from "@/lib/api"

export type UserSignupPayload = {
  name: string
  email: string
  password: string
}

export type UserLoginPayload = {
  email: string
  password: string
}

export type AuthenticatedUser = {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  updatedAt: string
}

export async function createUser(payload: UserSignupPayload) {
  const response = await api.post("/users", payload)
  return response.data
}

export async function loginUser(payload: UserLoginPayload) {
  const response = await api.post(
    "/api/auth/login",
    payload,
    { baseURL: window.location.origin }
  )
  return response.data
}

export async function fetchAuthenticatedUser() {
  const response = await api.get("/users/authenticated")
  return response.data as AuthenticatedUser
}

export async function logoutUser() {
  await api.post("/users/logout")
}
