"use client"

import { useSyncExternalStore } from "react"
import type { Locale } from "@/lib/i18n"

export const currencies = ["USD", "BRL"] as const

export type Currency = (typeof currencies)[number]

const STORAGE_KEY = "spendwise-currency"
const DEFAULT_CURRENCY: Currency = "USD"
const currencyLocales: Record<Currency, string> = {
  USD: "en-US",
  BRL: "pt-BR",
}

let currentCurrency: Currency = DEFAULT_CURRENCY
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

const emit = () => {
  listeners.forEach((listener) => listener())
}

export function setCurrency(currency: Currency) {
  currentCurrency = currency

  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, currency)
  }

  emit()
}

export function getCurrencySnapshot() {
  currentCurrency = getStoredCurrency()
  return currentCurrency
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
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount)
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
  const currency = useSyncExternalStore(
    subscribeCurrency,
    getCurrencySnapshot,
    () => DEFAULT_CURRENCY
  )

  return {
    currency,
    setCurrency,
  }
}
