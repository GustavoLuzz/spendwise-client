"use client"

import { Check, ChevronDown, Languages } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { locales, type Locale, useI18n } from "@/lib/i18n"

const languageLabels: Record<Locale, string> = {
  "en-US": "English",
  "pt-BR": "Português (Brasil)",
}

export function LanguageSelect() {
  const { locale, setLocale, t } = useI18n()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <Languages className="h-4 w-4" />
          <span>{languageLabels[locale]}</span>
          <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 rounded-2xl border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <DropdownMenuRadioGroup
          value={locale}
          onValueChange={(value) => setLocale(value as Locale)}
        >
          {locales.map((item) => (
            <DropdownMenuRadioItem
              key={item}
              value={item}
              className="rounded-xl py-3 pl-9 text-sm font-medium text-zinc-900 focus:bg-zinc-100 dark:text-zinc-50 dark:focus:bg-zinc-800"
            >
              <span className="flex w-full items-center justify-between">
                {item === "pt-BR"
                  ? t("language.portugueseBrazil")
                  : t("language.english")}
                {locale === item && <Check className="h-4 w-4" />}
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
