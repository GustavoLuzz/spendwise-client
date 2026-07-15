"use client"

import { useEffect, useSyncExternalStore } from "react"
import { convertCurrency } from "@/lib/exchange-rates"
import type { Locale } from "@/lib/i18n"

export const currencies = ["USD", "BRL"] as const

export type Currency = (typeof currencies)[number]

const STORAGE_KEY = "spendwise-currency"
const EXCHANGE_RATE_STORAGE_KEY = "spendwise-usd-brl-rate"
const DEFAULT_CURRENCY: Currency = "USD"
const currencyLocales: Record<Currency, string> = {
  USD: "en-US",
  BRL: "pt-BR",
}

let currentCurrency: Currency = DEFAULT_CURRENCY
let usdBrlRate = 1
let hasLoadedExchangeRate = false
let isExchangeRateLoading = false
let exchangeRateRequest: Promise<boolean> | null = null
let currencyVersion = 0
const listeners = new Set<() => void>()

const isCurrency = (value: string | null): value is Currency =>
  value === "USD" || value === "BRL"

const getStoredCurrency = () => {
  if (typeof window === "undefined") {
    return DEFAULT_CURRENCY
  }

  const stored = window.localStorage.getItem(STORAGE_KEY)
  return isCurrency(stored) ? stored : DEFAULT_CURRENCY
}

const loadStoredExchangeRate = () => {
  if (typeof window === "undefined") {
    return
  }

  const storedRate = Number(
    window.localStorage.getItem(EXCHANGE_RATE_STORAGE_KEY)
  )

  if (Number.isFinite(storedRate) && storedRate > 0) {
    usdBrlRate = storedRate
    hasLoadedExchangeRate = true
  }
}

const emit = () => {
  currencyVersion += 1
  listeners.forEach((listener) => listener())
}

async function loadExchangeRate() {
  if (exchangeRateRequest) {
    return exchangeRateRequest
  }

  isExchangeRateLoading = true
  emit()

  exchangeRateRequest = convertCurrency("USD", "BRL", 1)
    .then((conversion) => {
      if (!Number.isFinite(conversion.rate) || conversion.rate <= 0) {
        throw new Error("Invalid exchange rate")
      }

      usdBrlRate = conversion.rate
      hasLoadedExchangeRate = true

      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          EXCHANGE_RATE_STORAGE_KEY,
          String(conversion.rate)
        )
      }

      return true
    })
    .catch(() => false)
    .finally(() => {
      isExchangeRateLoading = false
      exchangeRateRequest = null
      emit()
    })

  return exchangeRateRequest
}

export async function setCurrency(currency: Currency) {
  if (currency === currentCurrency) {
    return true
  }

  const rateLoaded = await loadExchangeRate()

  if (!rateLoaded) {
    return false
  }

  currentCurrency = currency

  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, currency)
  }

  emit()
  return true
}

export function getCurrencySnapshot() {
  currentCurrency = getStoredCurrency()
  loadStoredExchangeRate()
  return `${currentCurrency}:${currencyVersion}`
}

export function subscribeCurrency(listener: () => void) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

export function formatCurrency(
  amount: number,
  locale: Locale,
  currency: Currency
) {
  const convertedAmount = currency === "BRL" ? amount * usdBrlRate : amount

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(convertedAmount)
}

export function convertAmountToBaseCurrency(
  amount: number,
  currency: Currency
) {
  return currency === "BRL" ? amount / usdBrlRate : amount
}

export function getCurrencySymbol(locale: Locale, currency: Currency) {
  return (
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
    })
      .formatToParts(0)
      .find((part) => part.type === "currency")?.value ?? currency
  )
}

const getCurrencySeparators = (currency: Currency) => {
  const parts = new Intl.NumberFormat(currencyLocales[currency]).formatToParts(
    1234.5
  )

  return {
    decimal:
      parts.find((part) => part.type === "decimal")?.value ??
      (currency === "BRL" ? "," : "."),
    group:
      parts.find((part) => part.type === "group")?.value ??
      (currency === "BRL" ? "." : ","),
  }
}

export function formatMoneyInput(value: string, currency: Currency) {
  if (!value) {
    return ""
  }

  const { decimal, group } = getCurrencySeparators(currency)
  const allowedCharacters = new RegExp(
    `^[\\d${decimal === "." ? "\\." : decimal}${group === "." ? "\\." : group}]*$`
  )

  if (!allowedCharacters.test(value)) {
    return null
  }

  const ungroupedValue = value.split(group).join("")
  const parts = ungroupedValue.split(decimal)

  if (
    parts.length > 2 ||
    !/^\d*$/.test(parts[0]) ||
    (parts[1] !== undefined && !/^\d{0,2}$/.test(parts[1]))
  ) {
    return null
  }

  const integerDigits = parts[0].replace(/^0+(?=\d)/, "") || "0"
  const groupedInteger = new Intl.NumberFormat(currencyLocales[currency], {
    maximumFractionDigits: 0,
    useGrouping: true,
  }).format(Number(integerDigits))

  if (parts[1] === undefined) {
    return groupedInteger
  }

  return `${groupedInteger}${decimal}${parts[1]}`
}

export function parseMoneyInput(value: string, currency: Currency) {
  const { decimal, group } = getCurrencySeparators(currency)
  const normalizedValue = value
    .split(group)
    .join("")
    .replace(decimal, ".")

  if (!/^\d+(?:\.\d{1,2})?$/.test(normalizedValue)) {
    return null
  }

  const amount = Number(normalizedValue)
  return Number.isFinite(amount) ? amount : null
}

export function useCurrency() {
  const currencySnapshot = useSyncExternalStore(
    subscribeCurrency,
    getCurrencySnapshot,
    () => `${DEFAULT_CURRENCY}:0`
  )
  const currency = currencySnapshot.split(":")[0] as Currency

  useEffect(() => {
    void loadExchangeRate()
  }, [])

  return {
    currency,
    setCurrency,
    isExchangeRateLoading,
    hasExchangeRate: hasLoadedExchangeRate,
  }
}
