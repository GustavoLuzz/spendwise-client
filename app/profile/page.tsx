"use client"

import axios from "axios"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  Languages,
  Loader2,
  LogOut,
  Mail,
  Moon,
  ShieldCheck,
  UserRound,
} from "lucide-react"

import { AppFooterNav } from "@/components/app-footer-nav"
import { CurrencySelect } from "@/components/currency-select"
import { LanguageSelect } from "@/components/language-select"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  fetchAuthenticatedUser,
  logoutUser,
  type AuthenticatedUser,
} from "@/lib/users"
import { useI18n } from "@/lib/i18n"

const formatDate = (value?: string, fallback = "Unavailable") => {
  if (!value) {
    return fallback
  }

  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  })
}

const getInitials = (name?: string) => {
  if (!name) {
    return "SW"
  }

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
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

export default function ProfilePage() {
  const router = useRouter()
  const { t } = useI18n()
  const [user, setUser] = useState<AuthenticatedUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true

    const loadUser = async () => {
      setLoading(true)
      setError("")

      try {
        const response = await fetchAuthenticatedUser()

        if (active) {
          setUser(response)
        }
      } catch (error: unknown) {
        if (!active) return

        if (axios.isAxiosError(error)) {
          setError(
            getServerMessage(error.response?.data) ?? "Unable to load profile"
          )
        } else {
          setError("Unable to load profile")
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadUser()

    return () => {
      active = false
    }
  }, [])

  const clearAuthCookie = () => {
    document.cookie = "token=; Path=/; Max-Age=0; SameSite=Lax"
  }

  const handleLogout = async () => {
    setLoggingOut(true)

    try {
      await logoutUser()
    } finally {
      clearAuthCookie()
      router.replace("/login")
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto w-full max-w-sm px-4 pb-28 pt-5">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
            aria-label={t("common.back")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
            {t("profile.title")}
          </div>

          <ThemeToggle />
        </header>

        <section className="mt-8 text-center">
          <div className="relative mx-auto h-24 w-24">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border border-zinc-200 bg-gradient-to-br from-zinc-100 to-white text-2xl font-semibold shadow-sm dark:border-zinc-800 dark:from-zinc-800 dark:to-zinc-900">
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
              ) : (
                getInitials(user?.name)
              )}
            </div>
            <span className="absolute bottom-1 right-1 inline-flex h-8 w-8 items-center justify-center rounded-full border-4 border-zinc-50 bg-zinc-900 text-white dark:border-zinc-950 dark:bg-zinc-100 dark:text-zinc-900">
              <UserRound className="h-4 w-4" />
            </span>
          </div>

          <h1 className="mt-4 text-xl font-semibold">
            {loading ? t("profile.loading") : user?.name ?? "SpendWise User"}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {user?.email ?? t("profile.accountDetails")}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-500 shadow-sm dark:bg-zinc-900 dark:text-zinc-400">
            <BadgeCheck className="h-3.5 w-3.5" />
            {user?.role ?? t("profile.member")}
          </div>
        </section>

        {error && (
          <p className="mt-6 rounded-3xl bg-rose-50 p-4 text-sm text-rose-600 dark:bg-rose-950/40 dark:text-rose-300">
            {error}
          </p>
        )}

        <section className="mt-8">
          <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-zinc-400">
            {t("profile.account")}
          </p>

          <div className="mt-3 overflow-hidden rounded-3xl border border-zinc-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-3 px-4 py-4">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                <UserRound className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">
                  {t("profile.personalInformation")}
                </p>
                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {user?.name ?? t("profile.nameUnavailable")}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-zinc-400" />
            </div>

            <div className="mx-4 h-px bg-zinc-100 dark:bg-zinc-800" />

            <div className="flex items-center gap-3 px-4 py-4">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                <Mail className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{t("profile.email")}</p>
                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {user?.email ?? t("profile.emailUnavailable")}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-zinc-400" />
            </div>
          </div>
        </section>

        <section className="mt-6">
          <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-zinc-400">
            {t("profile.preferences")}
          </p>

          <div className="mt-3 overflow-hidden rounded-3xl border border-zinc-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-3 px-4 py-4">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                <Languages className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{t("profile.appearance")}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {t("profile.appearanceHint")}
                </p>
              </div>
              <ThemeToggle />
            </div>

            <div className="mx-4 h-px bg-zinc-100 dark:bg-zinc-800" />

            <div className="flex items-center gap-3 px-4 py-4">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                <Moon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{t("profile.language")}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {t("profile.languageHint")}
                </p>
              </div>
              <LanguageSelect />
            </div>

            <div className="mx-4 h-px bg-zinc-100 dark:bg-zinc-800" />

            <div className="flex items-center gap-3 px-4 py-4">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                <CircleDollarSign className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{t("profile.currency")}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {t("profile.currencyHint")}
                </p>
              </div>
              <CurrencySelect />
            </div>
          </div>
        </section>

        <section className="mt-6">
          <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-zinc-400">
            {t("profile.security")}
          </p>

          <div className="mt-3 overflow-hidden rounded-3xl border border-zinc-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-3 px-4 py-4">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">
                  {t("profile.authenticatedSession")}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {t("profile.sessionHint")}
                </p>
              </div>
              <span className="rounded-full bg-emerald-100 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                {t("profile.active")}
              </span>
            </div>

            <div className="mx-4 h-px bg-zinc-100 dark:bg-zinc-800" />

            <div className="flex items-center gap-3 px-4 py-4">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                <CalendarDays className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{t("profile.memberSince")}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {formatDate(user?.createdAt, t("profile.unavailable"))}
                </p>
              </div>
            </div>
          </div>
        </section>

        <Button
          type="button"
          variant="outline"
          onClick={handleLogout}
          disabled={loggingOut}
          className="mt-8 h-12 w-full rounded-2xl border-rose-200 bg-white text-sm font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900 dark:bg-zinc-950 dark:text-rose-300 dark:hover:bg-rose-950/40"
        >
          {loggingOut ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          {t("profile.logout")}
        </Button>
      </div>

      <AppFooterNav activeHref="/profile" />
    </div>
  )
}
