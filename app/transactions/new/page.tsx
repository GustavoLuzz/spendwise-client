"use client"

import Link from "next/link"
import { Suspense, useEffect, useMemo, useState } from "react"
import axios from "axios"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  HelpCircle,
  Tag,
  Calendar as CalendarIcon,
  X,
} from "lucide-react"

import { AppFooterNav } from "@/components/app-footer-nav"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { fetchCategoriesByType } from "@/lib/categories"
import { getCategoryLabel } from "@/lib/category-label"
import {
  formatMoneyInput,
  getCurrencySymbol,
  parseMoneyInput,
  useCurrency,
} from "@/lib/currency"
import { useI18n } from "@/lib/i18n"
import { createTransaction } from "@/lib/transactions"
import type { Category } from "@/lib/categories"

const helpItems = [
  {
    titleKey: "common.amount",
    descriptionKey: "newTransaction.helpAmount",
  },
  {
    titleKey: "common.type",
    descriptionKey: "newTransaction.helpType",
  },
  {
    titleKey: "common.category",
    descriptionKey: "newTransaction.helpCategory",
  },
  {
    titleKey: "common.date",
    descriptionKey: "newTransaction.helpDate",
  },
]

const MAX_TRANSACTION_AMOUNT = 10_000_000

function NewTransactionContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { locale, t } = useI18n()
  const { currency } = useCurrency()
  const returnTo = searchParams.get("from") === "transactions" ? "/transactions" : "/"
  const [type, setType] = useState<"expense" | "income">("expense")
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    categoryId: "",
  })
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [showCalendar, setShowCalendar] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const loadCategoriesError = t("newTransaction.loadCategoriesError")

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
        const list = await fetchCategoriesByType(
          type === "expense" ? "EXPENSE" : "INCOME"
        )
        if (!active) return
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
            category: message ?? loadCategoriesError,
          }))
        } else {
          setErrors(prev => ({
            ...prev,
            category: loadCategoriesError,
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
  }, [type, loadCategoriesError])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (name === "amount") {
      const formattedValue = formatMoneyInput(value, currency)

      if (formattedValue === null) {
        setErrors(prev => ({
          ...prev,
          amount: t("newTransaction.amountInvalid"),
        }))
        return
      }

      setFormData(prev => ({ ...prev, amount: formattedValue }))
      if (errors.amount) {
        setErrors(prev => ({ ...prev, amount: "" }))
      }
      return
    }

    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const handleCategorySelect = (categoryId: string) => {
    setFormData(prev => ({ ...prev, categoryId }))
    if (errors.categoryId || errors.category) {
      setErrors(prev => ({ ...prev, categoryId: "", category: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    const amountValue = parseMoneyInput(formData.amount, currency)

    if (!formData.amount.trim()) {
      newErrors.amount = t("newTransaction.amountRequired")
    } else if (amountValue === null) {
      newErrors.amount = t("newTransaction.amountInvalid")
    } else if (amountValue <= 0) {
      newErrors.amount = t("newTransaction.amountPositive")
    } else if (amountValue > MAX_TRANSACTION_AMOUNT) {
      newErrors.amount = t("newTransaction.amountMax")
    }

    if (!formData.description.trim()) {
      newErrors.description = t("newTransaction.descriptionRequired")
    }

    if (!formData.categoryId) {
      newErrors.categoryId = t("newTransaction.categoryRequired")
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    const amountValue = parseMoneyInput(formData.amount, currency)
    if (amountValue === null) return

    setLoading(true)
    try {
      const dateString = selectedDate
        ? selectedDate.toISOString().split("T")[0]
        : null

      await createTransaction({
        description: formData.description.trim(),
        amount: amountValue,
        categoryId: formData.categoryId,
        optionalDate: dateString,
      })
      router.push(returnTo)
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message = getServerMessage(error.response?.data)
        setErrors(prev => ({
          ...prev,
          submit: message ?? t("newTransaction.submitError"),
        }))
      } else {
        setErrors(prev => ({
          ...prev,
          submit: t("newTransaction.submitError"),
        }))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto w-full max-w-sm px-4 pb-28 pt-6">
        <form onSubmit={handleSubmit}>
          <header className="flex items-center justify-between">
            <Link
              href={returnTo}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-lg font-semibold">{t("newTransaction.title")}</h1>
            <button
              type="button"
              onClick={() => setShowHelp(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-zinc-500 dark:text-zinc-400"
              aria-label={t("newTransaction.help")}
            >
              <HelpCircle className="h-5 w-5" />
            </button>
          </header>

          <section className="mt-8 text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-zinc-400 dark:text-zinc-500">
              {t("common.amount")}
            </p>
            <div className="mt-4 flex items-end justify-center gap-4">
              <span className="text-2xl text-zinc-500 dark:text-zinc-400">
                {getCurrencySymbol(locale, currency)}
              </span>
              <input
                type="text"
                name="amount"
                inputMode="decimal"
                maxLength={16}
                placeholder={currency === "BRL" ? "0,00" : "0.00"}
                value={formData.amount}
                onChange={handleChange}
                disabled={loading}
                aria-invalid={Boolean(errors.amount)}
                className={`w-44 border-b-2 bg-transparent pb-3 text-center text-6xl font-semibold font-mono tabular-nums text-zinc-700 placeholder:text-zinc-300 outline-none dark:text-zinc-100 dark:placeholder:text-zinc-700 ${
                  errors.amount ? "border-rose-500" : "border-zinc-900"
                }`}
              />
            </div>
            {errors.amount && (
              <p className="mt-2 text-sm text-rose-500">{errors.amount}</p>
            )}

            <div className="mt-6 inline-flex rounded-2xl bg-zinc-100 p-1 shadow-sm dark:bg-zinc-900">
              <button
                type="button"
                onClick={() => {
                  setType("expense")
                  setErrors(prev => ({ ...prev, category: "", categoryId: "" }))
                }}
                className={`px-6 py-2 text-sm font-semibold rounded-2xl transition ${
                  type === "expense"
                    ? "bg-zinc-900 text-white shadow"
                    : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                {t("common.expense")}
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
                    : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                {t("common.income")}
              </button>
            </div>
          </section>

          <div className="mt-8 space-y-6">
            <div className="rounded-3xl bg-zinc-100/70 p-5 dark:bg-zinc-900">
              <p className="text-xs uppercase tracking-[0.35em] text-zinc-500 dark:text-zinc-400">
                {t("newTransaction.description")}
              </p>
              <input
                type="text"
                name="description"
                placeholder={t("newTransaction.descriptionPlaceholder")}
                value={formData.description}
                onChange={handleChange}
                disabled={loading}
                className="mt-3 w-full bg-transparent text-base text-zinc-700 placeholder:text-zinc-400 outline-none dark:text-zinc-100 dark:placeholder:text-zinc-600"
              />
              {errors.description && (
                <p className="mt-2 text-sm text-rose-500">
                  {errors.description}
                </p>
              )}
            </div>

            <div className="rounded-3xl bg-zinc-100/70 p-5 dark:bg-zinc-900">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-zinc-500 dark:text-zinc-400">
                <Tag className="h-4 w-4" />
                {t("newTransaction.category")}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    disabled={loading || loadingCategories}
                    className="mt-3 flex h-14 w-full items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 text-left shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span
                        className={`h-3 w-3 shrink-0 rounded-full ${
                          selectedCategory
                            ? type === "income"
                              ? "bg-emerald-500"
                              : "bg-rose-500"
                            : "bg-zinc-300 dark:bg-zinc-700"
                        }`}
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-base font-semibold text-zinc-900 dark:text-zinc-50">
                          {loadingCategories
                            ? t("newTransaction.loadingCategories")
                            : selectedCategory
                              ? getCategoryLabel(
                                  selectedCategory.name,
                                  selectedCategory.isGlobal,
                                  t
                                )
                              :
                              t("newTransaction.selectCategory")}
                        </span>
                        <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                          {selectedCategory
                            ? t("newTransaction.categoryType", {
                                type:
                                  type === "income"
                                    ? t("common.income")
                                    : t("common.expense"),
                              })
                            : t("newTransaction.categoryHint")}
                        </span>
                      </span>
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  sideOffset={8}
                  className="w-[var(--radix-dropdown-menu-trigger-width)] rounded-2xl border-zinc-200 bg-white p-2 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
                >
                  {categories.length === 0 ? (
                    <div className="px-3 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                      {loadingCategories
                        ? t("newTransaction.loadingCategories")
                        : t("newTransaction.noCategories")}
                    </div>
                  ) : (
                    <DropdownMenuRadioGroup
                      value={formData.categoryId}
                      onValueChange={handleCategorySelect}
                    >
                      {categories.map(category => (
                        <DropdownMenuRadioItem
                          key={category.id}
                          value={category.id}
                          className="rounded-xl px-3 py-3 pl-9 text-sm font-medium text-zinc-900 focus:bg-zinc-100 dark:text-zinc-50 dark:focus:bg-zinc-800"
                        >
                          <span className="flex min-w-0 flex-1 items-center justify-between gap-3">
                            <span className="truncate">
                              {getCategoryLabel(
                                category.name,
                                category.isGlobal,
                                t
                              )}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] ${
                                category.type === "INCOME"
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                  : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                              }`}
                            >
                              {category.type === "INCOME"
                                ? t("common.income")
                                : t("common.expense")}
                            </span>
                          </span>
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              {(errors.categoryId || errors.category) && (
                <p className="mt-2 text-sm text-rose-500">
                  {errors.categoryId ?? errors.category}
                </p>
              )}
            </div>

            <div className="rounded-3xl bg-zinc-100/70 p-5 dark:bg-zinc-900">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-zinc-500 dark:text-zinc-400">
                <CalendarIcon className="h-4 w-4" />
                {t("newTransaction.dateOptional")}
              </div>
              {selectedDate ? (
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-base font-medium text-zinc-900 dark:text-zinc-50">
                    {selectedDate.toLocaleDateString(locale, {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedDate(undefined)}
                    className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="mt-3 w-full py-2 text-center text-base text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                >
                  {t("newTransaction.pickDate")}
                </button>
              )}
              {showCalendar && (
                <div className="mt-4 flex justify-center rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date)
                      setShowCalendar(false)
                    }}
                    disabled={(date) =>
                      date > new Date()
                    }
                    className="[&_.rdp]:w-fit"
                  />
                </div>
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
              {loading ? t("newTransaction.registering") : t("newTransaction.register")}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push(returnTo)}
              className="h-12 w-full rounded-2xl bg-zinc-200 text-zinc-900 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
            >
              {t("common.cancel")}
            </Button>
          </div>
        </form>
      </div>

      {showHelp && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/60 px-4"
          onClick={() => setShowHelp(false)}
        >
          <section
            className="mb-4 w-full max-w-sm rounded-[2rem] bg-white p-5 shadow-2xl animate-in slide-in-from-bottom-8 duration-300 dark:bg-zinc-900 dark:text-zinc-50"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-zinc-400 dark:text-zinc-500">
                  {t("newTransaction.help")}
                </p>
                <h2 className="mt-2 text-xl font-semibold">
                  {t("newTransaction.helpTitle")}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                aria-label="Close help"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {helpItems.map((item) => (
                <div
                  key={item.titleKey}
                  className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800"
                >
                  <p className="text-sm font-semibold">{t(item.titleKey)}</p>
                  <p className="mt-1 text-sm leading-5 text-zinc-500 dark:text-zinc-400">
                    {t(item.descriptionKey)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      <AppFooterNav activeHref="/transactions" />
    </div>
  )
}

export default function NewTransactionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
          <div className="mx-auto flex min-h-screen w-full max-w-sm items-center justify-center px-4">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Loading...
            </p>
          </div>
        </div>
      }
    >
      <NewTransactionContent />
    </Suspense>
  )
}
