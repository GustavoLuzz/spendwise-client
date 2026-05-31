"use client"

import { useState } from "react"
import axios from "axios"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const handleFocus = (field: keyof typeof formData) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email must be valid"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const setAuthCookie = (token: string) => {
    const secure = window.location.protocol === "https:"
    const cookieParts = [
      `token=${encodeURIComponent(token)}`,
      "Path=/",
      "SameSite=Lax",
    ]
    if (secure) {
      cookieParts.push("Secure")
    }
    document.cookie = cookieParts.join("; ")
  }

  const getServerMessage = (data: unknown) => {
    if (!data || typeof data !== "object" || !("message" in data)) {
      return null
    }
    const message = (data as { message?: unknown }).message
    return typeof message === "string" && message.trim().length > 0
      ? message
      : null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    try {
      const response = await api.post("/users/login", formData)

      console.log("Login successful!", response.data)

      const token = response.data?.token ?? response.data?.accessToken
      if (token) {
        setAuthCookie(token)
      }

      router.push("/")
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message = getServerMessage(error.response?.data)
        setErrors(prev => ({
          ...prev,
          submit: message ?? "Invalid email or password",
        }))
      } else {
        setErrors(prev => ({ ...prev, submit: "An unexpected error occurred" }))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          onFocus={() => handleFocus("email")}
          disabled={loading}
          className={errors.email ? "border-red-500" : ""}
        />
        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          value={formData.password}
          onChange={handleChange}
          onFocus={() => handleFocus("password")}
          disabled={loading}
          className={errors.password ? "border-red-500" : ""}
        />
        {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
      </div>

      {errors.submit && <p className="text-sm text-red-500">{errors.submit}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Signing in..." : "Sign in"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="underline hover:text-primary">
          Sign up
        </Link>
      </p>
    </form>
  )
}
