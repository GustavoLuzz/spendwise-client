"use client"

import axios from "axios"
import { useId, useState } from "react"
import { ArrowRightLeft, Calculator, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  formatCurrency,
  formatMoneyInput,
  getCurrencySymbol,
  parseMoneyInput,
  type Currency,
} from "@/lib/currency"
import {
  convertCurrency,
  type CurrencyConversion,
} from "@/lib/exchange-rates"
import { useI18n } from "@/lib/i18n"

const MAX_AMOUNT = 10_000_000

export function CurrencyConverter() {
  const amountId = useId()
  const { locale, t } = useI18n()
  const [from, setFrom] = useState<Currency>("USD")
  const [to, setTo] = useState<Currency>("BRL")
  const [amount, setAmount] = useState("")
  const [result, setResult] = useState<CurrencyConversion | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSwap = () => {
    setFrom(to)
    setTo(from)
    setAmount("")
    setResult(null)
    setError("")
  }

  const handleAmountChange = (value: string) => {
    const formattedValue = formatMoneyInput(value, from)

    if (formattedValue === null) {
      setError(t("currencyConverter.invalidAmount"))
      return
    }

    setAmount(formattedValue)
    setResult(null)
    setError("")
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const parsedAmount = parseMoneyInput(amount, from)

    if (parsedAmount === null || parsedAmount <= 0) {
      setError(t("currencyConverter.invalidAmount"))
      return
    }

    if (parsedAmount > MAX_AMOUNT) {
      setError(t("currencyConverter.maxAmount"))
      return
    }

    setLoading(true)
    setError("")

    try {
      setResult(await convertCurrency(from, to, parsedAmount))
    } catch (requestError: unknown) {
      if (axios.isAxiosError(requestError) && requestError.response?.status === 400) {
        setError(t("currencyConverter.invalidAmount"))
      } else {
        setError(t("currencyConverter.serviceError"))
      }
    } finally {
      setLoading(false)
    }
  }

  const formattedRate = result
    ? new Intl.NumberFormat(locale, {
        style: "currency",
        currency: result.to,
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
      }).format(result.rate)
    : ""

  const formattedUpdatedAt = result
    ? new Intl.DateTimeFormat(locale, {
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date(result.updatedAt))
    : ""

  return (
    <section className="mt-6">
      <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-zinc-400">
        {t("currencyConverter.section")}
      </p>

      <div className="mt-3 overflow-hidden rounded-3xl border border-zinc-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start gap-3 border-b border-zinc-100 px-4 py-4 dark:border-zinc-800">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <Calculator className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-sm font-semibold">{t("currencyConverter.title")}</h2>
            <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
              {t("currencyConverter.subtitle")}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div className="rounded-2xl bg-zinc-100 px-3 py-3 dark:bg-zinc-800">
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                {t("currencyConverter.from")}
              </p>
              <p className="mt-1 text-sm font-bold">{from}</p>
            </div>

            <button
              type="button"
              onClick={handleSwap}
              disabled={loading}
              aria-label={t("currencyConverter.swap")}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 shadow-sm transition-transform hover:rotate-180 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
            >
              <ArrowRightLeft className="h-4 w-4" />
            </button>

            <div className="rounded-2xl bg-zinc-100 px-3 py-3 text-right dark:bg-zinc-800">
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                {t("currencyConverter.to")}
              </p>
              <p className="mt-1 text-sm font-bold">{to}</p>
            </div>
          </div>

          <div>
            <label htmlFor={amountId} className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
              {t("currencyConverter.amount")}
            </label>
            <div className="relative mt-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-zinc-400">
                {getCurrencySymbol(locale, from)}
              </span>
              <Input
                id={amountId}
                value={amount}
                onChange={(event) => handleAmountChange(event.target.value)}
                inputMode="decimal"
                autoComplete="off"
                disabled={loading}
                placeholder={from === "BRL" ? "0,00" : "0.00"}
                aria-invalid={Boolean(error)}
                className="h-12 rounded-2xl pl-11 text-base font-semibold"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-2xl bg-rose-50 px-3 py-2.5 text-xs text-rose-600 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="h-11 w-full rounded-2xl">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? t("currencyConverter.converting") : t("currencyConverter.convert")}
          </Button>
        </form>

        {result && (
          <div className="border-t border-zinc-100 bg-emerald-50/70 px-4 py-5 dark:border-zinc-800 dark:bg-emerald-950/20">
            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-emerald-700 dark:text-emerald-300">
              {t("currencyConverter.result")}
            </p>
            <p className="mt-2 break-words text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
              {formatCurrency(result.convertedAmount, locale, result.to)}
            </p>
            <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-300">
              1 {result.from} = {formattedRate}
            </p>
            <p className="mt-3 text-[10px] text-zinc-500 dark:text-zinc-400">
              {t("currencyConverter.updatedAt", { date: formattedUpdatedAt })} · {result.source}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
