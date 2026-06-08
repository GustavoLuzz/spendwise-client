"use client"

import { useState } from "react"
import axios from "axios"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useI18n } from "@/lib/i18n"
import { loginUser } from "@/lib/users"

export function LoginForm() {
  const { t } = useI18n()
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
      newErrors.email = t("auth.emailRequired")
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("auth.emailInvalid")
    }

    if (!formData.password) {
      newErrors.password = t("auth.passwordRequired")
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
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
      await loginUser(formData)
      window.location.replace("/")
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message = getServerMessage(error.response?.data)
        setErrors(prev => ({
          ...prev,
          submit: message ?? t("auth.invalidCredentials"),
        }))
      } else {
        setErrors(prev => ({ ...prev, submit: t("auth.unexpectedError") }))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      action="/api/auth/login"
      method="post"
      onSubmit={handleSubmit}
      className="space-y-4"
      noValidate
    >
      <div className="space-y-2">
        <Label htmlFor="email">{t("auth.email")}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder={t("auth.emailPlaceholder")}
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
        <Label htmlFor="password">{t("auth.password")}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder={t("auth.passwordPlaceholder")}
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
        {loading ? t("auth.signingIn") : t("auth.signIn")}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {t("auth.noAccount")}{" "}
        <Link href="/signup" className="underline hover:text-primary">
          {t("auth.signUp")}
        </Link>
      </p>
    </form>
  )
}
