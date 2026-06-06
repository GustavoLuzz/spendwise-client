"use client"

import axios from "axios"
import Link from "next/link"
import { useEffect, useState } from "react"
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Banknote,
  Loader2,
  Plus,
  Receipt,
  TrendingUp,
} from "lucide-react"

import { AppFooterNav } from "@/components/app-footer-nav"
import { Button } from "@/components/ui/button"
import { formatCurrency, useCurrency } from "@/lib/currency"
import { useI18n } from "@/lib/i18n"
import { fetchTransactions, type Transaction } from "@/lib/transactions"

const parseDateOnly = (value: string) => {
  const [year, month, day] = value.split("-").map(Number)
  return new Date(year, month - 1, day)
}

const getTransactionDate = (transaction: Transaction) =>
  transaction.optionalDate
    ? parseDateOnly(transaction.optionalDate)
    : new Date(transaction.createdAt)

const getSignedAmount = (transaction: Transaction) => {
  const amount = Math.abs(Number(transaction.amount))
  return transaction.categoryType === "EXPENSE" ? -amount : amount
}

const isCurrentMonth = (transaction: Transaction) => {
  const date = getTransactionDate(transaction)
  const today = new Date()

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth()
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

export default function Home() {
  const { locale, t } = useI18n()
  const { currency } = useCurrency()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true

    const loadDashboard = async () => {
      setLoading(true)
      setError("")

      try {
        const response = await fetchTransactions({
          page: 0,
          size: 1000,
          period: "all",
        })

        if (active) {
          setTransactions(response.content)
        }
      } catch (error: unknown) {
        if (!active) return

        if (axios.isAxiosError(error)) {
          setError(
            getServerMessage(error.response?.data) ?? "Unable to load dashboard"
          )
        } else {
          setError("Unable to load dashboard")
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      active = false
    }
  }, [])

  const totalBalance = transactions.reduce(
    (total, transaction) => total + getSignedAmount(transaction),
    0
  )
  const monthlyTransactions = transactions.filter(isCurrentMonth)
  const monthlyIncome = monthlyTransactions.reduce((total, transaction) => {
    if (transaction.categoryType === "EXPENSE") {
      return total
    }

    return total + Math.abs(Number(transaction.amount))
  }, 0)
  const monthlyExpenses = monthlyTransactions.reduce((total, transaction) => {
    if (transaction.categoryType !== "EXPENSE") {
      return total
    }

    return total + Math.abs(Number(transaction.amount))
  }, 0)
  const recentActivity = [...transactions]
    .sort(
      (a, b) =>
        getTransactionDate(b).getTime() - getTransactionDate(a).getTime() ||
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 4)
  const balanceTrend =
    monthlyIncome + monthlyExpenses > 0
      ? ((monthlyIncome - monthlyExpenses) /
          (monthlyIncome + monthlyExpenses)) *
        100
      : 0
  const monthlyNet = monthlyIncome - monthlyExpenses
  const monthlyTotal = monthlyIncome + monthlyExpenses
  const incomeShare = monthlyTotal > 0 ? (monthlyIncome / monthlyTotal) * 100 : 0
  const expenseShare =
    monthlyTotal > 0 ? (monthlyExpenses / monthlyTotal) * 100 : 0
  const snapshotMessage =
    monthlyTransactions.length === 0
      ? t("dashboard.addFirstMonthly")
      : monthlyNet >= 0
        ? t("dashboard.positiveMonth")
        : t("dashboard.expensesHigher")

  const stats = [
    {
      label: t("dashboard.monthlyIncome"),
      value: formatCurrency(monthlyIncome, locale, currency),
      icon: ArrowDown,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      label: t("dashboard.monthlyExpenses"),
      value: formatCurrency(monthlyExpenses, locale, currency),
      icon: ArrowUp,
      iconBg: "bg-rose-100",
      iconColor: "text-rose-600",
    },
  ]

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto w-full max-w-sm px-4 pb-28 pt-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                className="h-5 w-5 text-zinc-900 dark:text-zinc-50"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="m8 0 6.61 3h.89a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5H15v7a.5.5 0 0 1 .485.38l.5 2a.498.498 0 0 1-.485.62H.5a.498.498 0 0 1-.485-.62l.5-2A.5.5 0 0 1 1 13V6H.5a.5.5 0 0 1-.5-.5v-2A.5.5 0 0 1 .5 3h.89zM3.777 3h8.447L8 1zM2 6v7h1V6zm2 0v7h2.5V6zm3.5 0v7h1V6zm2 0v7H12V6zM13 6v7h1V6zm2-1V4H1v1zm-.39 9H1.39l-.25 1h13.72z" />
              </svg>
            </span>
            SpendWise
          </div>
          <Link
            href="/profile"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-zinc-700 dark:text-zinc-300"
            aria-label="Go to profile"
          >
            <ArrowRight className="h-5 w-5" />
          </Link>
        </header>

        <section className="mt-6 rounded-3xl bg-gradient-to-br from-white to-zinc-200/80 p-6 shadow-sm dark:from-zinc-900 dark:to-zinc-800">
          <p className="text-xs uppercase tracking-[0.35em] text-zinc-500 dark:text-zinc-400">
            {t("dashboard.totalBalance")}
          </p>
          <p className="mt-3 text-[38px] font-semibold leading-tight font-mono tabular-nums">
            {formatCurrency(loading ? 0 : totalBalance, locale, currency)}
          </p>
          <div className="mt-3 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                balanceTrend >= 0
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-rose-100 text-rose-700"
              }`}
            >
              <TrendingUp className="h-3 w-3" />
              {balanceTrend >= 0 ? "+" : ""}
              {balanceTrend.toFixed(1)}%
            </span>
            {t("dashboard.currentMonthNet")}
          </div>
          <div className="mt-6 flex gap-3">
            <Button
              asChild
              className="h-12 flex-1 rounded-2xl bg-zinc-900 text-sm text-white hover:bg-zinc-800"
            >
              <Link href="/transactions/new">
                <Plus className="h-4 w-4" />
                <span className="text-left leading-tight">
                  {t("dashboard.newTransaction")
                    .split("\n")
                    .map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                </span>
              </Link>
            </Button>
            <Button
              asChild
              variant="secondary"
              className="h-12 flex-1 rounded-2xl bg-zinc-200 text-sm text-zinc-900 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
            >
              <Link href="/transactions">
                {t("dashboard.viewAnalytics")
                  .split("\n")
                  .map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
              </Link>
            </Button>
          </div>
        </section>

        {error && (
          <p className="mt-4 rounded-3xl bg-rose-50 p-4 text-sm text-rose-600">
            {error}
          </p>
        )}

        <div className="mt-6 grid gap-4">
          {stats.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-3xl border border-zinc-100 bg-white px-5 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div>
                  <p className="text-[11px] uppercase tracking-[0.35em] text-zinc-500 dark:text-zinc-400">
                    {item.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold font-mono tabular-nums">
                    {loading
                      ? formatCurrency(0, locale, currency)
                      : item.value}
                  </p>
                </div>
                <span
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-full ${item.iconBg}`}
                >
                  <Icon className={`h-5 w-5 ${item.iconColor}`} />
                </span>
              </div>
            )
          })}
        </div>

        <section className="mt-6 rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-zinc-500 dark:text-zinc-400">
                {t("dashboard.monthlySnapshot")}
              </p>
              <h2 className="mt-3 text-3xl font-semibold font-mono tabular-nums">
                {loading
                  ? formatCurrency(0, locale, currency)
                  : monthlyTransactions.length === 0
                    ? t("dashboard.noDataYet")
                    : formatCurrency(monthlyNet, locale, currency)}
              </h2>
            </div>
            <span
              className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                monthlyNet >= 0
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-rose-100 text-rose-600"
              }`}
            >
              {monthlyNet >= 0 ? (
                <ArrowDown className="h-5 w-5" />
              ) : (
                <ArrowUp className="h-5 w-5" />
              )}
            </span>
          </div>

          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            {loading ? t("dashboard.loadingInsight") : snapshotMessage}
          </p>

          <div className="mt-6 h-3 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            {monthlyTotal > 0 ? (
              <div className="flex h-full w-full">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${incomeShare}%` }}
                />
                <div
                  className="h-full bg-rose-500"
                  style={{ width: `${expenseShare}%` }}
                />
              </div>
            ) : (
              <div className="h-full w-full bg-zinc-200 dark:bg-zinc-700" />
            )}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-700">
                {t("common.income")}
              </p>
              <p className="mt-2 text-lg font-semibold font-mono tabular-nums text-emerald-700">
                {formatCurrency(loading ? 0 : monthlyIncome, locale, currency)}
              </p>
            </div>
            <div className="rounded-2xl bg-rose-50 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-rose-700">
                {t("common.expenses")}
              </p>
              <p className="mt-2 text-lg font-semibold font-mono tabular-nums text-rose-700">
                {formatCurrency(loading ? 0 : monthlyExpenses, locale, currency)}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {t("dashboard.recentActivity")}
            </h2>
            <Link href="/transactions" className="text-sm text-zinc-500 dark:text-zinc-400">
              {t("dashboard.viewAll")}
            </Link>
          </div>
          <div className="mt-4 space-y-4">
            {loading ? (
              <div className="flex items-center gap-3 rounded-3xl bg-zinc-50 p-4 dark:bg-zinc-800">
                <Loader2 className="h-4 w-4 animate-spin text-zinc-500 dark:text-zinc-400" />
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {t("dashboard.loadingActivity")}
                </p>
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-zinc-200 bg-zinc-50 p-5 text-center dark:border-zinc-700 dark:bg-zinc-800">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {t("dashboard.noTransactions")}
                </p>
              </div>
            ) : (
              recentActivity.map((item) => {
                const isIncome = item.categoryType === "INCOME"
                const Icon = isIncome ? Banknote : Receipt
                const signedAmount = getSignedAmount(item)

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
                        <Icon className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
                      </span>
                      <div className="min-w-0">
                        <p
                          className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold"
                          title={item.description}
                        >
                          {item.description}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {getTransactionDate(item).toLocaleDateString(locale, {
                            month: "long",
                            day: "2-digit",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`shrink-0 text-sm font-semibold ${
                        isIncome ? "text-emerald-600" : "text-rose-600"
                      } font-mono tabular-nums`}
                    >
                      {signedAmount > 0 ? "+" : "-"}{" "}
                      {formatCurrency(
                        Math.abs(signedAmount),
                        locale,
                        currency
                      )}
                    </p>
                  </div>
                )
              })
            )}
          </div>
        </section>

        <section className="relative mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 text-white shadow-sm">
          <p className="text-xs uppercase tracking-[0.35em] text-zinc-400">
            {t("dashboard.savingsGoal")}
          </p>
          <p className="mt-3 text-lg font-semibold">
            {t("dashboard.savingsGoalName")}
          </p>
          <div className="mt-5 h-2 w-full rounded-full bg-white/20">
            <div className="h-2 w-2/3 rounded-full bg-white" />
          </div>
          <p className="mt-2 text-xs text-zinc-400">
            {t("dashboard.savingsGoalProgress")}
          </p>
          <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full border border-white/10" />
        </section>
      </div>

      <Button
        asChild
        size="icon"
        className="fixed bottom-24 right-6 h-12 w-12 rounded-full bg-zinc-900 text-white shadow-lg hover:bg-zinc-800"
        aria-label="Add transaction"
      >
        <Link href="/transactions/new">
          <Plus className="h-5 w-5" />
        </Link>
      </Button>

      <AppFooterNav activeHref="/" />
    </div>
  )
}
