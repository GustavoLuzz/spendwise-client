import { api } from "@/lib/api"
import {
  convertAmountToBaseCurrency,
  type Currency,
} from "@/lib/currency"

export type Transaction = {
  id: string
  description: string
  amount: number
  currency?: Currency | null
  createdAt: string
  optionalDate: string | null
  categoryId: string | null
  categoryName?: string | null
  categoryType?: "EXPENSE" | "INCOME" | null
}

export type CreateTransactionPayload = {
  description: string
  amount: number
  currency: Currency
  categoryId: string
  optionalDate?: string | null
}

export type FetchTransactionsParams = {
  page?: number
  size?: number
  sort?: string
  period?: "week" | "month" | "year" | "all"
  categoryId?: string
  categoryType?: "EXPENSE" | "INCOME"
  search?: string
}

export type TransactionPage = {
  content: Transaction[]
  number: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export async function fetchTransactions(params?: FetchTransactionsParams) {
  const response = await api.get("/transactions", { params })
  return response.data as TransactionPage
}

export async function createTransaction(payload: CreateTransactionPayload) {
  const response = await api.post("/transactions", payload)
  return response.data as Transaction
}

export async function deleteTransaction(id: string) {
  await api.delete(`/transactions/${id}`)
}

export function getTransactionBaseAmount(transaction: Transaction) {
  return convertAmountToBaseCurrency(
    Number(transaction.amount),
    transaction.currency ?? "USD"
  )
}
