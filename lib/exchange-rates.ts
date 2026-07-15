import { api } from "@/lib/api"
import type { Currency } from "@/lib/currency"

export type CurrencyConversion = {
  from: Currency
  to: Currency
  amount: number
  rate: number
  convertedAmount: number
  updatedAt: string
  source: string
}

export async function convertCurrency(
  from: Currency,
  to: Currency,
  amount: number
) {
  const response = await api.get("/exchange-rates/convert", {
    params: { from, to, amount },
  })
  return response.data as CurrencyConversion
}
