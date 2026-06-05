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

type AuthResponse = {
  token?: string
  accessToken?: string
}

const getTokenFromResponse = (data: unknown) => {
  if (!data || typeof data !== "object") {
    return undefined
  }

  const response = data as AuthResponse
  return response.token ?? response.accessToken
}

export async function createUser(payload: UserSignupPayload) {
  const response = await api.post("/users", payload)
  return response.data
}

export async function loginUser(payload: UserLoginPayload) {
  const response = await api.post("/users/login", payload)

  return {
    data: response.data,
    token: getTokenFromResponse(response.data),
  }
}
