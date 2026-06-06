"use client"

import Image from "next/image"
import Link from "next/link"
import { SignupForm } from "@/components/signup-form"
import { ThemeToggle } from "@/components/theme-toggle"
import { useI18n } from "@/lib/i18n"

export default function SignupPage() {
  const { t } = useI18n()

  return (
    <div className="grid min-h-svh bg-background text-foreground lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              className="h-5 w-5 text-foreground"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="m8 0 6.61 3h.89a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5H15v7a.5.5 0 0 1 .485.38l.5 2a.498.498 0 0 1-.485.62H.5a.498.498 0 0 1-.485-.62l.5-2A.5.5 0 0 1 1 13V6H.5a.5.5 0 0 1-.5-.5v-2A.5.5 0 0 1 .5 3h.89zM3.777 3h8.447L8 1zM2 6v7h1V6zm2 0v7h2.5V6zm3.5 0v7h1V6zm2 0v7H12V6zM13 6v7h1V6zm2-1V4H1v1zm-.39 9H1.39l-.25 1h13.72z" />
            </svg>
            Spendwise
          </Link>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <h1 className="text-2xl font-bold mb-6">
              {t("auth.createAccount")}
            </h1>
            <SignupForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src="https://images.pexels.com/photos/2008426/pexels-photo-2008426.jpeg"
          alt="Image"
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
      </div>
    </div>
  )
}
