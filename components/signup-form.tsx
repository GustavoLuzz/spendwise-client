"use client"

import { useState } from "react"
import axios from "axios"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useI18n } from "@/lib/i18n"
import { createUser } from "@/lib/users"

const PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_LENGTH = 32
const PASSWORD_CONTENT_PATTERN = /^(?=.*\p{L})(?=.*\d)[^\p{Cc}]+$/u

export function SignupForm() {
  const router = useRouter()
  const { t } = useI18n()
  const [formData, setFormData] = useState({
    name: "",
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

    if (!formData.name.trim()) {
      newErrors.name = t("auth.nameRequired")
    } else if (formData.name.length < 2) {
      newErrors.name = t("auth.nameMin")
    }

    if (!formData.email.trim()) {
      newErrors.email = t("auth.emailRequired")
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("auth.emailInvalid")
    }

    if (!formData.password) {
      newErrors.password = t("auth.passwordRequired")
    } else if (
      formData.password.length < PASSWORD_MIN_LENGTH ||
      formData.password.length > PASSWORD_MAX_LENGTH
    ) {
      newErrors.password = t("auth.passwordLength")
    } else if (!PASSWORD_CONTENT_PATTERN.test(formData.password)) {
      newErrors.password = t("auth.passwordPattern")
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

  const translateServerMessage = (message: string | null) => {
    if (!message) return null

    const normalizedMessage = message.toLowerCase()

    if (normalizedMessage.includes("email already registered")) {
      return t("auth.emailAlreadyRegistered")
    }

    if (normalizedMessage.includes("password must be between")) {
      return t("auth.passwordLength")
    }

    if (normalizedMessage.includes("password must include")) {
      return t("auth.passwordPattern")
    }

    if (normalizedMessage.includes("email must be valid")) {
      return t("auth.emailInvalid")
    }

    return message
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    try {
      await createUser(formData)

      router.push("/login")
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message = translateServerMessage(
          getServerMessage(error.response?.data)
        )
        setErrors(prev => ({
          ...prev,
          submit: message ?? t("auth.createAccountFailed"),
        }))
      } else {
        setErrors(prev => ({ ...prev, submit: t("auth.unexpectedError") }))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="name">{t("auth.name")}</Label>
        <Input
          id="name"
          name="name"
          placeholder={t("auth.namePlaceholder")}
          autoComplete="name"
          value={formData.name}
          onChange={handleChange}
          onFocus={() => handleFocus("name")}
          disabled={loading}
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
      </div>

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
          autoComplete="new-password"
          maxLength={PASSWORD_MAX_LENGTH}
          value={formData.password}
          onChange={handleChange}
          onFocus={() => handleFocus("password")}
          disabled={loading}
          className={errors.password ? "border-red-500" : ""}
        />
        {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
        {!errors.password && (
          <p className="text-xs text-muted-foreground">
            {t("auth.passwordHint")}
          </p>
        )}
      </div>

      {errors.submit && <p className="text-sm text-red-500">{errors.submit}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? t("auth.signingUp") : t("auth.signUp")}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {t("auth.hasAccount")}{" "}
        <Link href="/login" className="underline hover:text-primary">
          {t("auth.signIn")}
        </Link>
      </p>
    </form>
  )
}
