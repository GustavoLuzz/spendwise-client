"use client"

import Link from "next/link"
import { LayoutGrid, Receipt, Tags, User } from "lucide-react"
import { useI18n } from "@/lib/i18n"

const navItems = [
  { labelKey: "nav.dashboard", icon: LayoutGrid, href: "/" },
  { labelKey: "nav.transactions", icon: Receipt, href: "/transactions" },
  { labelKey: "nav.categories", icon: Tags, href: "/categories" },
  { labelKey: "nav.profile", icon: User, href: "/profile" },
]

type AppFooterNavProps = {
  activeHref: string
}

export function AppFooterNav({ activeHref }: AppFooterNavProps) {
  const { t } = useI18n()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-sm items-center justify-between px-6 py-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.href === activeHref

          return (
            <Link
              key={item.labelKey}
              href={item.href}
              className={`flex flex-col items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.22em] ${
                isActive
                  ? "text-zinc-900 dark:text-zinc-50"
                  : "text-zinc-400 dark:text-zinc-600"
              }`}
            >
              <span
                className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${
                  isActive ? "bg-zinc-100 dark:bg-zinc-900" : ""
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>
              {t(item.labelKey)}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
