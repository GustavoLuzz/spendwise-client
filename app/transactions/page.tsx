"use client"

import axios from "axios"
import Link from "next/link"
import { useEffect, useMemo, useState, type FormEvent } from "react"
import {
  ArrowLeft,
  ArrowUpRight,
  Loader2,
  Plus,
  Search,
} from "lucide-react"

import { AppFooterNav } from "@/components/app-footer-nav"
import { Button } from "@/components/ui/button"
import { fetchCategories, type Category } from "@/lib/categories"
import { getCategoryLabel } from "@/lib/category-label"
import {
  formatCurrency as formatMoney,
  type Currency,
  useCurrency,
} from "@/lib/currency"
import { type Locale, useI18n } from "@/lib/i18n"
import {
  fetchTransactions,
  getTransactionBaseAmount,
  type Transaction,
  type TransactionPage,
} from "@/lib/transactions"

const periodOptions = [
  { labelKey: "transactions.weekly", value: "week" as const },
  { labelKey: "transactions.monthly", value: "month" as const },
  { labelKey: "transactions.yearly", value: "year" as const },
  { labelKey: "transactions.allTime", value: "all" as const },
]

const categoryTypeOptions = [
  { labelKey: "transactions.allTypes", value: "all" as const },
  { labelKey: "common.expense", value: "EXPENSE" as const },
  { labelKey: "common.income", value: "INCOME" as const },
]

type FilterType = (typeof categoryTypeOptions)[number]["value"]
type Period = (typeof periodOptions)[number]["value"]

type GroupedTransactions = {
  key: string
  label: string
  incomeTotal: number
  expenseTotal: number
  items: Transaction[]
}

const formatCurrency = (
  amount: number,
  categoryType: Transaction["categoryType"],
  locale: Locale,
  currency: Currency
) => {
  const signedAmount =
    categoryType === "EXPENSE" ? -Math.abs(amount) : Math.abs(amount)

  return formatMoney(signedAmount, locale, currency)
}

const formatAmount = (
  amount: number,
  locale: Locale,
  currency: Currency
) => formatMoney(Math.abs(amount), locale, currency)

const parseDateOnly = (value: string) => {
  const [year, month, day] = value.split("-").map(Number)
  return new Date(year, month - 1, day)
}

const formatShortDate = (date: Date) =>
  date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  })

const formatFullDate = (date: Date) =>
  date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  })

const getTransactionDate = (transaction: Transaction) =>
  transaction.optionalDate
    ? parseDateOnly(transaction.optionalDate)
    : new Date(transaction.createdAt)

const getDateKey = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`

const getDateKeyFromDate = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`

const getCreatedAtTime = (transaction: Transaction) => {
  const timestamp = Date.parse(transaction.createdAt)
  return Number.isNaN(timestamp) ? 0 : timestamp
}

const getPeriodStartDate = (period: Period) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  switch (period) {
    case "week": {
      const start = new Date(today)
      start.setDate(today.getDate() - 6)
      return start
    }
    case "month":
      return new Date(today.getFullYear(), today.getMonth(), 1)
    case "year":
      return new Date(today.getFullYear(), 0, 1)
    case "all":
      return null
  }
}

const isTransactionInPeriod = (transaction: Transaction, period: Period) => {
  const start = getPeriodStartDate(period)

  if (!start) {
    return true
  }

  const transactionDate = getTransactionDate(transaction)
  transactionDate.setHours(0, 0, 0, 0)

  const today = new Date()
  today.setHours(23, 59, 59, 999)

  return transactionDate >= start && transactionDate <= today
}

const formatGroupLabel = (date: Date) => {
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  if (getDateKey(date) === getDateKeyFromDate(today)) {
    return `TODAY, ${formatShortDate(date).toUpperCase()}`
  }

  if (getDateKey(date) === getDateKeyFromDate(yesterday)) {
    return `YESTERDAY, ${formatShortDate(date).toUpperCase()}`
  }

  return formatFullDate(date).toUpperCase()
}

const groupTransactions = (transactions: Transaction[]): GroupedTransactions[] => {
  const grouped = new Map<string, GroupedTransactions>()

  transactions.forEach((transaction) => {
    const transactionDate = getTransactionDate(transaction)
    const key = getDateKey(transactionDate)
    const amount = getTransactionBaseAmount(transaction)
    const current = grouped.get(key)

    if (current) {
      if (transaction.categoryType === "EXPENSE") {
        current.expenseTotal += amount
      } else {
        current.incomeTotal += amount
      }
      current.items.push(transaction)
      return
    }

    grouped.set(key, {
      key,
      label: formatGroupLabel(transactionDate),
      incomeTotal: transaction.categoryType === "EXPENSE" ? 0 : amount,
      expenseTotal: transaction.categoryType === "EXPENSE" ? amount : 0,
      items: [transaction],
    })
  })

  return [...grouped.values()]
    .map((group) => ({
      ...group,
      items: [...group.items].sort(
        (a, b) => getCreatedAtTime(b) - getCreatedAtTime(a)
      ),
    }))
    .sort(
      (a, b) =>
        getTransactionDate(b.items[0]).getTime() -
        getTransactionDate(a.items[0]).getTime()
    )
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

export default function TransactionsPage() {
  const { locale, t } = useI18n()
  const { currency } = useCurrency()
  const [pageData, setPageData] = useState<TransactionPage | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(0)
  const [period, setPeriod] = useState<(typeof periodOptions)[number]["value"]>("month")
  const [categoryType, setCategoryType] = useState<FilterType>("all")
  const [categoryId, setCategoryId] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  useEffect(() => {
    let active = true

    const loadCategories = async () => {
      setLoadingCategories(true)
      try {
        const list = await fetchCategories()
        if (active) {
          setCategories(list)
        }
      } catch (error: unknown) {
        if (!active) return
        if (axios.isAxiosError(error)) {
          setError(getServerMessage(error.response?.data) ?? "Unable to load categories")
        } else {
          setError("Unable to load categories")
        }
      } finally {
        if (active) {
          setLoadingCategories(false)
        }
      }
    }

    loadCategories()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    const loadTransactions = async () => {
      setLoading(true)
      setError("")

      try {
        const response = await fetchTransactions({
          page,
          size: 10,
          sort: "createdAt,desc",
          period,
          categoryId: categoryId || undefined,
          categoryType: categoryType === "all" ? undefined : categoryType,
          search: search.trim() || undefined,
        })

        if (active) {
          setPageData(response)
        }
      } catch (error: unknown) {
        if (!active) return

        if (axios.isAxiosError(error)) {
          setError(getServerMessage(error.response?.data) ?? "Unable to load transactions")
        } else {
          setError("Unable to load transactions")
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadTransactions()

    return () => {
      active = false
    }
  }, [page, period, categoryId, categoryType, search])

  const visibleTransactions = useMemo(
    () =>
      (pageData?.content ?? []).filter((transaction) =>
        isTransactionInPeriod(transaction, period)
      ),
    [pageData?.content, period]
  )

  const groupedTransactions = useMemo(
    () => groupTransactions(visibleTransactions),
    [visibleTransactions]
  )

  const filteredCategories = useMemo(() => {
    if (categoryType === "all") {
      return categories
    }

    return categories.filter((category) => category.type === categoryType)
  }, [categories, categoryType])

  const globalCategoryIds = useMemo(
    () =>
      new Set(
        categories
          .filter((category) => category.isGlobal)
          .map((category) => category.id)
      ),
    [categories]
  )

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPage(0)
    setSearch(searchInput.trim())
  }

  const handlePeriodChange = (value: (typeof periodOptions)[number]["value"]) => {
    setPage(0)
    setPeriod(value)
  }

  const handleCategoryTypeChange = (value: FilterType) => {
    setPage(0)
    setCategoryType(value)
    setCategoryId("")
  }

  const handleCategoryChange = (value: string) => {
    setPage(0)
    setCategoryId(value)
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto w-full max-w-sm px-4 pb-28 pt-5">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div className="flex items-center gap-2">
            <Button
              asChild
              className="h-10 rounded-full bg-zinc-900 px-4 text-sm text-white hover:bg-zinc-800"
            >
              <Link href="/transactions/new?from=transactions">
                <Plus className="h-4 w-4" />
                {t("newTransaction.short")}
              </Link>
            </Button>
          </div>
        </header>

        <section className="mt-5 rounded-[1.5rem] bg-gradient-to-br from-white to-zinc-200/80 p-4 shadow-sm dark:from-zinc-900 dark:to-zinc-800">
          <p className="text-[11px] uppercase tracking-[0.35em] text-zinc-500 dark:text-zinc-400">
            {t("transactions.history")}
          </p>
          <h1 className="mt-2 text-2xl font-semibold leading-tight">
            {t("transactions.title")}
          </h1>

          <div className="mt-4 flex flex-wrap gap-2">
            {periodOptions.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => handlePeriodChange(item.value)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  period === item.value
                    ? "bg-zinc-900 text-white"
                    : "bg-white/80 text-zinc-500 dark:bg-zinc-800/80 dark:text-zinc-400"
                }`}
              >
                {t(item.labelKey)}
              </button>
            ))}
          </div>
        </section>

        <form
          onSubmit={handleSearchSubmit}
          className="mt-4 flex items-center gap-3 rounded-3xl bg-white px-4 py-3 shadow-sm dark:bg-zinc-900"
        >
          <Search className="h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500" />
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder={t("transactions.searchPlaceholder")}
            className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
          />
          <Button type="submit" size="sm" className="rounded-full bg-zinc-900 text-white">
            {t("common.search")}
          </Button>
        </form>

        <section className="mt-4 flex flex-wrap items-center gap-2">
          {categoryTypeOptions.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => handleCategoryTypeChange(item.value)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold shadow-sm ${
                categoryType === item.value
                  ? "bg-zinc-900 text-white"
                  : "bg-white text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400"
              }`}
            >
              {t(item.labelKey)}
            </button>
          ))}
        </section>

        <div className="relative mt-3">
          <section className="flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => handleCategoryChange("")}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold shadow-sm ${
                categoryId === "" ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900" : "bg-white text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400"
              }`}
            >
              {t("transactions.allCategories")}
            </button>
            {filteredCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategoryChange(category.id)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold shadow-sm ${
                  categoryId === category.id
                    ? "bg-white text-zinc-900 dark:bg-zinc-50 dark:text-zinc-900"
                    : "bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400"
                }`}
              >
                {getCategoryLabel(category.name, category.isGlobal, t)}
              </button>
            ))}
          </section>
          <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-zinc-50 to-transparent dark:from-zinc-950" />
        </div>

        <section className="mt-5 space-y-4">
          {loading ? (
            <div className="flex items-center gap-3 rounded-3xl bg-white p-4 shadow-sm dark:bg-zinc-900">
              <Loader2 className="h-4 w-4 animate-spin text-zinc-500 dark:text-zinc-400" />
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {t("transactions.loadingTransactions")}
              </p>
            </div>
          ) : error ? (
            <p className="rounded-3xl bg-rose-50 p-4 text-sm text-rose-600">{error}</p>
          ) : groupedTransactions.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-zinc-200 bg-white p-6 text-center shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {t("transactions.noTransactions")}
              </p>
            </div>
          ) : (
            groupedTransactions.map((group) => (
              <div key={group.key} className="space-y-2.5">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-zinc-400 dark:text-zinc-500">
                      {group.label}
                    </p>
                    {categoryType === "all" ? (
                      <div className="mt-2 flex items-center gap-4 text-xl font-semibold font-mono tabular-nums">
                        <span className="text-emerald-600">
                          {group.incomeTotal > 0
                            ? `+${formatAmount(group.incomeTotal, locale, currency)}`
                            : formatAmount(0, locale, currency)}
                        </span>
                        <span className="text-rose-600">
                          {group.expenseTotal > 0
                            ? `-${formatAmount(group.expenseTotal, locale, currency)}`
                            : formatAmount(0, locale, currency)}
                        </span>
                      </div>
                    ) : (
                      <p
                        className={`mt-2 text-xl font-semibold font-mono tabular-nums ${
                          categoryType === "INCOME"
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}
                      >
                        {categoryType === "INCOME"
                          ? group.incomeTotal > 0
                            ? `+${formatAmount(group.incomeTotal, locale, currency)}`
                            : formatAmount(0, locale, currency)
                          : group.expenseTotal > 0
                            ? `-${formatAmount(group.expenseTotal, locale, currency)}`
                            : formatAmount(0, locale, currency)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {group.items.map((item) => (
                    <article
                      key={item.id}
                      className="rounded-[1.5rem] border border-zinc-100 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p
                            className="overflow-hidden whitespace-nowrap text-ellipsis text-base font-semibold leading-tight"
                            title={item.description}
                          >
                            {item.description}
                          </p>
                          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                            {item.categoryName
                              ? getCategoryLabel(
                                  item.categoryName,
                                  item.categoryId
                                    ? globalCategoryIds.has(item.categoryId)
                                    : false,
                                  t
                                )
                              : t("common.category")}{" "}
                            •{" "}
                            {getTransactionDate(item).toLocaleDateString(locale, {
                              month: "short",
                              day: "2-digit",
                            })}
                          </p>
                        </div>
                        <p
                          className={`whitespace-nowrap text-base font-semibold font-mono tabular-nums ${
                            item.categoryType === "INCOME"
                              ? "text-emerald-600"
                              : "text-rose-600"
                          }`}
                        >
                          {formatCurrency(
                            getTransactionBaseAmount(item),
                            item.categoryType,
                            locale,
                            currency
                          )}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.28em] ${
                            item.categoryType === "INCOME"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {item.categoryType === "INCOME"
                            ? t("common.income")
                            : item.categoryType === "EXPENSE"
                              ? t("common.expense")
                              : t("transactions.transaction")}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedTransaction(item)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                          aria-label="View transaction details"
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))
          )}
        </section>

        {pageData && pageData.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between rounded-3xl bg-white px-4 py-3 shadow-sm dark:bg-zinc-900">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={pageData.first}
              onClick={() => setPage((current) => Math.max(current - 1, 0))}
              className="rounded-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
            >
              {t("common.previous")}
            </Button>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-zinc-400 dark:text-zinc-500">
              {t("transactions.page")} {pageData.number + 1} /{" "}
              {pageData.totalPages}
            </p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={pageData.last}
              onClick={() =>
                setPage((current) =>
                  pageData.last ? current : current + 1
                )
              }
              className="rounded-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
            >
              {t("common.next")}
            </Button>
          </div>
        )}

        {loadingCategories && !categories.length && (
          <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-500">
            {t("transactions.loadingCategories")}
          </p>
        )}
      </div>

      {selectedTransaction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 px-4"
          onClick={() => setSelectedTransaction(null)}
        >
          <div
            className="w-full max-w-sm rounded-[2rem] bg-white p-5 shadow-2xl dark:bg-zinc-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.35em] text-zinc-400 dark:text-zinc-500">
                  {t("transactions.details")}
                </p>
                <h2 className="mt-2 text-xl font-semibold leading-tight">
                  {selectedTransaction.description}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTransaction(null)}
                className="rounded-full px-3 py-1 text-sm text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                {t("common.close")}
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-3xl bg-zinc-50 p-4 dark:bg-zinc-800">
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500">
                  {t("common.amount")}
                </p>
                <p className="mt-2 text-3xl font-semibold font-mono tabular-nums">
                  {formatCurrency(
                    getTransactionBaseAmount(selectedTransaction),
                    selectedTransaction.categoryType,
                    locale,
                    currency
                  )}
                </p>
              </div>

              <div className="grid gap-3 text-sm">
                <div className="flex items-center justify-between rounded-2xl bg-zinc-50 px-4 py-3 dark:bg-zinc-800">
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {t("common.category")}
                  </span>
                  <span className="font-medium">
                    {selectedTransaction.categoryName
                      ? getCategoryLabel(
                          selectedTransaction.categoryName,
                          selectedTransaction.categoryId
                            ? globalCategoryIds.has(
                                selectedTransaction.categoryId
                              )
                            : false,
                          t
                        )
                      : t("common.category")}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-zinc-50 px-4 py-3 dark:bg-zinc-800">
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {t("common.type")}
                  </span>
                  <span className="font-medium">
                    {selectedTransaction.categoryType === "INCOME"
                      ? t("common.income")
                      : selectedTransaction.categoryType === "EXPENSE"
                        ? t("common.expense")
                        : t("transactions.transaction")}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-zinc-50 px-4 py-3 dark:bg-zinc-800">
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {t("common.date")}
                  </span>
                  <span className="font-medium">
                    {getTransactionDate(selectedTransaction).toLocaleDateString(
                      locale,
                      {
                        month: "short",
                        day: "2-digit",
                      }
                    )}
                  </span>
                </div>
                <div className="break-all rounded-2xl bg-zinc-50 px-4 py-3 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  <span className="mb-1 block text-zinc-400 dark:text-zinc-500">
                    {t("common.id")}
                  </span>
                  {selectedTransaction.id}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <AppFooterNav activeHref="/transactions" />
    </div>
  )
}
