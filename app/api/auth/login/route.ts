import { NextRequest, NextResponse } from "next/server"

type LoginPayload = {
  email: string
  password: string
}

const getPayload = async (request: NextRequest): Promise<LoginPayload> => {
  const contentType = request.headers.get("content-type") ?? ""

  if (contentType.includes("application/json")) {
    return request.json()
  }

  const formData = await request.formData()
  return {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  }
}

export async function POST(request: NextRequest) {
  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL
  const expectsJson = request.headers
    .get("content-type")
    ?.includes("application/json")

  if (!apiUrl) {
    return NextResponse.json(
      { message: "API URL is not configured" },
      { status: 500 }
    )
  }

  const payload = await getPayload(request)
  const apiResponse = await fetch(`${apiUrl}/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  })

  const data = await apiResponse.json().catch(() => ({
    message: "Unable to authenticate",
  }))

  if (!apiResponse.ok) {
    if (!expectsJson) {
      return NextResponse.redirect(new URL("/login", request.url), 303)
    }

    return NextResponse.json(data, { status: apiResponse.status })
  }

  const token =
    typeof data?.token === "string"
      ? data.token
      : typeof data?.accessToken === "string"
        ? data.accessToken
        : null

  if (!token) {
    return NextResponse.json(
      { message: "Authentication token was not returned" },
      { status: 502 }
    )
  }

  const response = expectsJson
    ? NextResponse.json({ authenticated: true })
    : NextResponse.redirect(new URL("/", request.url), 303)

  response.cookies.set("token", token, {
    httpOnly: true,
    secure: request.nextUrl.protocol === "https:",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  })

  return response
}
