"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const { t } = useI18n()
  const isDark = resolvedTheme === "dark"

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="rounded-full border-zinc-200 bg-white text-zinc-700 shadow-[var(--shadow-surface)] hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
      aria-label={isDark ? t("theme.light") : t("theme.dark")}
      suppressHydrationWarning
    >
      <span className="relative h-4 w-4">
        <Sun
          className={`absolute inset-0 h-4 w-4 transition-[opacity,transform] duration-150 ease-out ${
            isDark ? "scale-100 opacity-100" : "scale-75 opacity-0"
          }`}
        />
        <Moon
          className={`absolute inset-0 h-4 w-4 transition-[opacity,transform] duration-150 ease-out ${
            isDark ? "scale-75 opacity-0" : "scale-100 opacity-100"
          }`}
        />
      </span>
    </Button>
  )
}
