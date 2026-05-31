"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  HelpCircle,
  Tag,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"

type Category = {
  id: string
  name: string
  type: "EXPENSE" | "INCOME"
}

export default function NewTransactionPage() {
  const router = useRouter()
  const [type, setType] = useState<"expense" | "income">("expense")
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    categoryId: "",
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const selectedCategory = useMemo(
    () => categories.find(category => category.id === formData.categoryId),
    [categories, formData.categoryId]
  )

  const getServerMessage = (data: unknown) => {
    if (!data || typeof data !== "object" || !("message" in data)) {
      return null
    }
    const message = (data as { message?: unknown }).message
    return typeof message === "string" && message.trim().length > 0
      ? message
      : null
  }

  useEffect(() => {
    let active = true
    const fetchCategories = async () => {
      setLoadingCategories(true)
      try {
        const response = await api.get("/categories/type", {
          params: { type: type === "expense" ? "EXPENSE" : "INCOME" },
        })
        if (!active) return
        const list = Array.isArray(response.data) ? response.data : []
        setCategories(list)
        setFormData(prev => {
          const stillValid = list.some(
            category => category.id === prev.categoryId
          )
          if (stillValid) {
            return prev
          }
          return {
            ...prev,
            categoryId: list[0]?.id ?? "",
          }
        })
      } catch (error: unknown) {
        if (!active) return
        setCategories([])
        setFormData(prev => ({ ...prev, categoryId: "" }))
        if (axios.isAxiosError(error)) {
          const message = getServerMessage(error.response?.data)
          setErrors(prev => ({
            ...prev,
            category: message ?? "Unable to load categories",
          }))
        } else {
          setErrors(prev => ({
            ...prev,
            category: "Unable to load categories",
          }))
        }
      } finally {
        if (active) {
          setLoadingCategories(false)
        }
      }
    }
    fetchCategories()
    return () => {
      active = false
    }
  }, [type])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    const amountValue = Number.parseFloat(
      formData.amount.replace(",", ".")
    )

    if (!formData.amount.trim() || Number.isNaN(amountValue)) {
      newErrors.amount = "Amount is required"
    } else if (amountValue <= 0) {
      newErrors.amount = "Amount must be greater than zero"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "Category is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    const amountValue = Number.parseFloat(
      formData.amount.replace(",", ".")
    )

    setLoading(true)
    try {
      await api.post("/transactions", {
        description: formData.description.trim(),
        amount: amountValue,
        categoryId: formData.categoryId,
      })
      router.push("/")
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message = getServerMessage(error.response?.data)
        setErrors(prev => ({
          ...prev,
          submit: message ?? "Unable to register transaction",
        }))
      } else {
        setErrors(prev => ({
          ...prev,
          submit: "Unable to register transaction",
        }))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto w-full max-w-sm px-4 pb-10 pt-6">
        <form onSubmit={handleSubmit}>
          <header className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-lg font-semibold">New Transaction</h1>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-zinc-500"
              aria-label="Help"
            >
              <HelpCircle className="h-5 w-5" />
            </button>
          </header>

          <section className="mt-8 text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-zinc-400">
              Amount
            </p>
            <div className="mt-4 flex items-end justify-center gap-4">
              <span className="text-2xl text-zinc-500">$</span>
              <input
                type="text"
                name="amount"
                inputMode="decimal"
                placeholder="0.00"
                value={formData.amount}
                onChange={handleChange}
                disabled={loading}
                className={`w-44 border-b-2 bg-transparent pb-3 text-center text-6xl font-semibold font-mono tabular-nums text-zinc-700 placeholder:text-zinc-300 outline-none ${
                  errors.amount ? "border-rose-500" : "border-zinc-900"
                }`}
              />
            </div>
            {errors.amount && (
              <p className="mt-2 text-sm text-rose-500">{errors.amount}</p>
            )}

            <div className="mt-6 inline-flex rounded-2xl bg-zinc-100 p-1 shadow-sm">
              <button
                type="button"
                onClick={() => {
                  setType("expense")
                  setErrors(prev => ({ ...prev, category: "", categoryId: "" }))
                }}
                className={`px-6 py-2 text-sm font-semibold rounded-2xl transition ${
                  type === "expense"
                    ? "bg-zinc-900 text-white shadow"
                    : "text-zinc-500"
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => {
                  setType("income")
                  setErrors(prev => ({ ...prev, category: "", categoryId: "" }))
                }}
                className={`px-6 py-2 text-sm font-semibold rounded-2xl transition ${
                  type === "income"
                    ? "bg-zinc-900 text-white shadow"
                    : "text-zinc-500"
                }`}
              >
                Income
              </button>
            </div>
          </section>

          <div className="mt-8 space-y-6">
            <div className="rounded-3xl bg-zinc-100/70 p-5">
              <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
                Description
              </p>
              <input
                type="text"
                name="description"
                placeholder="What was this for?"
                value={formData.description}
                onChange={handleChange}
                disabled={loading}
                className="mt-3 w-full bg-transparent text-base text-zinc-700 placeholder:text-zinc-400 outline-none"
              />
              {errors.description && (
                <p className="mt-2 text-sm text-rose-500">
                  {errors.description}
                </p>
              )}
            </div>

            <div className="rounded-3xl bg-zinc-100/70 p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-zinc-500">
                <Tag className="h-4 w-4" />
                Category
              </div>
              <div className="relative mt-3 flex items-center">
                {selectedCategory ? (
                  <span className="absolute left-0 h-2.5 w-2.5 rounded-full bg-zinc-900" />
                ) : null}
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  disabled={loading || loadingCategories}
                  className="w-full appearance-none bg-transparent pl-5 pr-8 text-base font-medium text-zinc-900 outline-none"
                >
                  <option value="" disabled>
                    {loadingCategories ? "Loading categories..." : "Select a category"}
                  </option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-0 h-4 w-4 text-zinc-400" />
              </div>
              {(errors.categoryId || errors.category) && (
                <p className="mt-2 text-sm text-rose-500">
                  {errors.categoryId ?? errors.category}
                </p>
              )}
            </div>
          </div>

          {errors.submit && (
            <p className="mt-4 text-sm text-rose-500">{errors.submit}</p>
          )}

          <div className="mt-8 space-y-4">
            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-2xl bg-zinc-900 text-white hover:bg-zinc-800"
            >
              <CheckCircle2 className="h-5 w-5" />
              {loading ? "Registering..." : "Register Transaction"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
              className="h-12 w-full rounded-2xl bg-zinc-200 text-zinc-900 hover:bg-zinc-300"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
