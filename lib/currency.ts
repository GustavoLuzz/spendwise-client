"use client"

import { useSyncExternalStore } from "react"
import type { Locale } from "@/lib/i18n"

export const currencies = ["USD", "BRL"] as const

export type Currency = (typeof currencies)[number]

const STORAGE_KEY = "spendwise-currency"
const DEFAULT_CURRENCY: Currency = "USD"

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
