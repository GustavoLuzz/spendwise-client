"use client"

import axios from "axios"
import Link from "next/link"
import { useEffect, useMemo, useState, type FormEvent } from "react"
import {
  Loader2,
  LogOut,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  WalletCards,
  X,
} from "lucide-react"

import { AppFooterNav } from "@/components/app-footer-nav"
import { Button } from "@/components/ui/button"
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
  type Category,
} from "@/lib/categories"
import { getCategoryLabel } from "@/lib/category-label"
import { useI18n } from "@/lib/i18n"

const categoryTypeOptions = [
  { label: "Expense", value: "EXPENSE" as const },
  { label: "Income", value: "INCOME" as const },
]

const getServerMessage = (data: unknown) => {
  if (!data || typeof data !== "object" || !("message" in data)) {
    return null
  }

  const message = (data as { message?: unknown }).message
  return typeof message === "string" && message.trim().length > 0
    ? message
    : null
}

export default function CategoriesPage() {
  const { t } = useI18n()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")
  const [formError, setFormError] = useState("")
  const [deleteError, setDeleteError] = useState("")
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [name, setName] = useState("")
  const [type, setType] = useState<Category["type"]>("EXPENSE")

  const defaultCategories = useMemo(
    () =>
      categories
        .filter((category) => category.isGlobal)
        .sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
        ),
    [categories]
  )

  const customCategories = useMemo(
    () =>
      categories
        .filter((category) => !category.isGlobal)
        .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
      ),
    [categories]
  )

  useEffect(() => {
    let active = true

    const loadCategories = async () => {
      setLoading(true)
      setError("")

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
          setLoading(false)
        }
      }
    }

    loadCategories()

    return () => {
      active = false
    }
  }, [])

  const resetForm = () => {
    setEditingCategory(null)
    setName("")
    setType("EXPENSE")
    setFormError("")
  }

  const closeSheet = () => {
    if (saving) return

    setIsSheetOpen(false)
    resetForm()
  }

  const openCreateSheet = () => {
    resetForm()
    setIsSheetOpen(true)
  }

  const openEditSheet = (category: Category) => {
    setEditingCategory(category)
    setName(category.name)
    setType(category.type)
    setFormError("")
    setIsSheetOpen(true)
  }

  const closeDeleteDialog = () => {
    if (deleting) return

    setDeleteTarget(null)
    setDeleteError("")
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    setDeleting(true)
    setDeleteError("")

    try {
      await deleteCategory(deleteTarget.id)
      setCategories((current) =>
        current.filter((category) => category.id !== deleteTarget.id)
      )
      setDeleteTarget(null)
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setDeleteError(
          getServerMessage(error.response?.data) ?? "Unable to delete category"
        )
      } else {
        setDeleteError("Unable to delete category")
      }
    } finally {
      setDeleting(false)
    }
  }

  const finishEditing = () => {
    setIsSheetOpen(false)
    setEditingCategory(null)
    setName("")
    setType("EXPENSE")
    setFormError("")
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedName = name.trim()
    if (trimmedName.length < 3) {
      setFormError("Name must have at least 3 characters")
      return
    }

    setSaving(true)
    setFormError("")

    try {
      if (editingCategory) {
        const updated = await updateCategory(editingCategory, {
          name: trimmedName,
          type,
        })
        setCategories((current) =>
          current.map((category) =>
            category.id === updated.id ? updated : category
          )
        )
      } else {
        const category = await createCategory({
          name: trimmedName,
          type,
        })
        setCategories((current) => [...current, category])
      }

      finishEditing()
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setFormError(
          getServerMessage(error.response?.data) ??
            (editingCategory
              ? "Unable to update category"
              : "Unable to create category")
        )
      } else {
        setFormError(
          editingCategory
            ? "Unable to update category"
            : "Unable to create category"
        )
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto w-full max-w-5xl px-4 pb-28 pt-5 md:px-6 lg:px-8">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-base font-semibold">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
              <WalletCards className="h-4 w-4" />
            </span>
            SpendWise
          </Link>

          <Link
            href="/profile"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-zinc-700 dark:text-zinc-300"
            aria-label="Go to profile"
          >
            <LogOut className="h-5 w-5" />
          </Link>
        </header>

        <main className="mt-8 lg:grid lg:grid-cols-2 lg:gap-x-8">
          <section className="lg:col-span-2">
            <h1 className="text-2xl font-semibold leading-tight">
              {t("categories.title")}
            </h1>
            <p className="mt-2 max-w-[19rem] text-sm leading-5 text-zinc-500 dark:text-zinc-400">
              {t("categories.subtitle")}
            </p>
          </section>

          <section className="mt-7 lg:mt-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-600 dark:text-zinc-400">
                  {t("categories.customTitle")}
                </h2>
                <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                  {t("categories.customHint")}
                </p>
              </div>
              <button
                type="button"
                onClick={openCreateSheet}
                className="inline-flex h-9 items-center gap-1.5 rounded-full px-2 text-xs font-semibold text-zinc-900 hover:bg-zinc-100 dark:text-zinc-50 dark:hover:bg-zinc-900"
              >
                <Plus className="h-4 w-4" />
                {t("categories.add")}
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {loading ? (
                <div className="flex items-center gap-3 rounded-2xl bg-zinc-100 px-4 py-5 dark:bg-zinc-900">
                  <Loader2 className="h-4 w-4 animate-spin text-zinc-500 dark:text-zinc-400" />
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {t("categories.loading")}
                  </p>
                </div>
              ) : error ? (
                <p className="rounded-2xl bg-rose-50 px-4 py-5 text-sm text-rose-600">
                  {error}
                </p>
              ) : customCategories.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-200 px-4 py-8 text-center dark:border-zinc-800">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {t("categories.noCustom")}
                  </p>
                </div>
              ) : (
                customCategories.map((category) => (
                  <article
                    key={category.id}
                    className="rounded-2xl bg-zinc-100 px-4 py-4 dark:bg-zinc-900"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {getCategoryLabel(category.name, category.isGlobal, t)}
                        </p>
                        <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
                          {category.type === "INCOME"
                            ? t("common.income")
                            : t("common.expense")}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditSheet(category)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 hover:bg-white hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                          aria-label={`${t("categories.edit")} ${category.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteError("")
                            setDeleteTarget(category)
                          }}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
                          aria-label={`${t("categories.delete")} ${category.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="mt-8 lg:mt-8">
            <div>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-600 dark:text-zinc-400">
                {t("categories.defaultTitle")}
              </h2>
              <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                {t("categories.defaultHint")}
              </p>
            </div>

            <div className="mt-4 space-y-3">
              {!loading && !error && defaultCategories.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-200 px-4 py-8 text-center dark:border-zinc-800">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {t("categories.noDefault")}
                  </p>
                </div>
              ) : (
                defaultCategories.map((category) => (
                  <article
                    key={category.id}
                    className="rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-900/60"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {getCategoryLabel(category.name, category.isGlobal, t)}
                        </p>
                        <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
                          {category.type === "INCOME"
                            ? t("common.income")
                            : t("common.expense")}
                        </p>
                      </div>
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-zinc-400 shadow-sm dark:bg-zinc-800 dark:text-zinc-500">
                        <ShieldCheck className="h-4 w-4" />
                      </span>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </main>
      </div>

      <AppFooterNav activeHref="/categories" />

      {isSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/30 backdrop-blur-sm animate-in fade-in duration-200">
          <button
            type="button"
            className="absolute inset-0"
            aria-label={t("common.close")}
            onClick={closeSheet}
          />
          <section className="relative w-full max-w-sm rounded-t-[1.75rem] bg-white px-4 pb-5 pt-4 shadow-2xl animate-in slide-in-from-bottom-8 duration-300 dark:bg-zinc-900">
            <div className="mx-auto h-1 w-10 rounded-full bg-zinc-200 dark:bg-zinc-700" />
            <div className="mt-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">
                  {editingCategory
                    ? t("categories.editTitle")
                    : t("categories.newTitle")}
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {editingCategory
                    ? t("categories.editSubtitle")
                    : t("categories.newSubtitle")}
                </p>
              </div>
              <button
                type="button"
                onClick={closeSheet}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                aria-label={t("common.close")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  {t("categories.name")}
                </span>
                <input
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value)
                    if (formError) setFormError("")
                  }}
                  disabled={saving}
                  placeholder={t("categories.namePlaceholder")}
                  className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm font-medium text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-600 dark:focus:border-zinc-600"
                />
              </label>

              <div>
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  {t("common.type")}
                </p>
                <div className="mt-2 grid grid-cols-2 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-950">
                  {categoryTypeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      disabled={saving}
                      onClick={() => setType(option.value)}
                      className={`h-10 rounded-lg text-xs font-semibold uppercase transition ${
                        type === option.value
                          ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                          : "text-zinc-500 dark:text-zinc-400"
                      }`}
                    >
                      {option.value === "INCOME"
                        ? t("common.income")
                        : t("common.expense")}
                    </button>
                  ))}
                </div>
              </div>

              {formError && (
                <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">
                  {formError}
                </p>
              )}

              <div className="space-y-3 pt-1">
                <Button
                  type="submit"
                  disabled={saving}
                  className="h-11 w-full rounded-xl bg-zinc-950 text-sm text-white hover:bg-zinc-800"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {editingCategory
                        ? t("categories.updating")
                        : t("categories.creating")}
                    </>
                  ) : (
                    t(
                      editingCategory
                        ? "categories.update"
                        : "categories.create"
                    )
                  )}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={saving}
                  onClick={closeSheet}
                  className="h-11 w-full rounded-xl bg-zinc-200 text-sm text-zinc-900 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
                >
                  {t("common.cancel")}
                </Button>
              </div>
            </form>
          </section>
        </div>
      )}

      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 px-4"
          onClick={closeDeleteDialog}
        >
          <section
            className="w-full max-w-sm rounded-[2rem] bg-white p-5 shadow-2xl dark:bg-zinc-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-rose-500">
                  {t("categories.delete")}
                </p>
                <h2 className="mt-2 text-xl font-semibold">
                  {t("categories.deleteTitle")}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeDeleteDialog}
                disabled={deleting}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-50 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                aria-label={t("common.close")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800">
              <p className="font-semibold">{deleteTarget.name}</p>
              <p className="mt-2 text-sm leading-5 text-zinc-500 dark:text-zinc-400">
                {t("categories.deleteDescription")}
              </p>
            </div>

            {deleteError && (
              <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-950/40 dark:text-rose-300">
                {deleteError}
              </p>
            )}

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={closeDeleteDialog}
                disabled={deleting}
                className="h-11 rounded-xl bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="h-11 rounded-xl bg-rose-600 text-white hover:bg-rose-700"
              >
                {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                {deleting
                  ? t("categories.deleting")
                  : t("categories.delete")}
              </Button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
