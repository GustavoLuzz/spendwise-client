import Link from "next/link"
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Banknote,
  Car,
  LayoutGrid,
  Plus,
  Receipt,
  ShoppingBag,
  Tags,
  TrendingUp,
  User,
  Utensils,
} from "lucide-react"

import { Button } from "@/components/ui/button"

const stats = [
  {
    label: "Monthly Income",
    value: "$8,400.00",
    icon: ArrowDown,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    label: "Monthly Expenses",
    value: "$3,250.40",
    icon: ArrowUp,
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
  },
]

const chartData = [
  { month: "Jan", value: 28 },
  { month: "Feb", value: 34 },
  { month: "Mar", value: 24 },
  { month: "Apr", value: 42 },
  { month: "May", value: 56 },
  { month: "Jun", value: 38 },
  { month: "Jul", value: 70 },
]

const recentActivity = [
  {
    name: "Apple Store",
    date: "July 24, 2023",
    amount: "- $1,299.00",
    amountClass: "text-zinc-900",
    icon: ShoppingBag,
  },
  {
    name: "The Nomad Bistro",
    date: "July 22, 2023",
    amount: "- $84.20",
    amountClass: "text-zinc-900",
    icon: Utensils,
  },
  {
    name: "Monthly Salary",
    date: "July 20, 2023",
    amount: "+ $8,400.00",
    amountClass: "text-emerald-600",
    icon: Banknote,
  },
  {
    name: "Uber Trip",
    date: "July 18, 2023",
    amount: "- $22.50",
    amountClass: "text-zinc-900",
    icon: Car,
  },
]

const navItems = [
  { label: "Dash", icon: LayoutGrid, href: "/" },
  { label: "Trans", icon: Receipt, href: "/transactions" },
  { label: "Cats", icon: Tags, href: "/categories" },
  { label: "User", icon: User, href: "/profile" },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto w-full max-w-sm px-4 pb-28 pt-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-200 bg-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                className="h-5 w-5 text-zinc-900"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="m8 0 6.61 3h.89a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5H15v7a.5.5 0 0 1 .485.38l.5 2a.498.498 0 0 1-.485.62H.5a.498.498 0 0 1-.485-.62l.5-2A.5.5 0 0 1 1 13V6H.5a.5.5 0 0 1-.5-.5v-2A.5.5 0 0 1 .5 3h.89zM3.777 3h8.447L8 1zM2 6v7h1V6zm2 0v7h2.5V6zm3.5 0v7h1V6zm2 0v7H12V6zM13 6v7h1V6zm2-1V4H1v1zm-.39 9H1.39l-.25 1h13.72z" />
              </svg>
            </span>
            SpendWise
          </div>
          <Link
            href="/profile"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-zinc-700"
            aria-label="Go to profile"
          >
            <ArrowRight className="h-5 w-5" />
          </Link>
        </header>

        <section className="mt-6 rounded-3xl bg-gradient-to-br from-white to-zinc-200/80 p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
            Total Balance
          </p>
          <p className="mt-3 text-[38px] font-semibold leading-tight font-mono tabular-nums">
            $42,850.20
          </p>
          <div className="mt-3 flex items-center gap-2 text-sm text-zinc-500">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              <TrendingUp className="h-3 w-3" />
              +12.5%
            </span>
            vs last month
          </div>
          <div className="mt-6 flex gap-3">
            <Button
              asChild
              className="h-12 flex-1 rounded-2xl bg-zinc-900 text-sm text-white hover:bg-zinc-800"
            >
              <Link href="/transactions/new">
                <Plus className="h-4 w-4" />
                <span className="text-left leading-tight">
                  New
                  <br />
                  Transaction
                </span>
              </Link>
            </Button>
            <Button
              variant="secondary"
              className="h-12 flex-1 rounded-2xl bg-zinc-200 text-sm text-zinc-900 hover:bg-zinc-300"
            >
              View
              <br />
              Analytics
            </Button>
          </div>
        </section>

        <div className="mt-6 grid gap-4">
          {stats.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-3xl border border-zinc-100 bg-white px-5 py-4 shadow-sm"
              >
                <div>
                  <p className="text-[11px] uppercase tracking-[0.35em] text-zinc-500">
                    {item.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold font-mono tabular-nums">
                    {item.value}
                  </p>
                </div>
                <span
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-full ${item.iconBg}`}
                >
                  <Icon className={`h-5 w-5 ${item.iconColor}`} />
                </span>
              </div>
            )
          })}
        </div>

        <section className="mt-6 rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold leading-tight">
              Balance
              <br />
              Evolution
            </h2>
            <div className="flex gap-2 rounded-full bg-zinc-100 p-1 text-xs font-semibold text-zinc-500">
              {["6M", "1Y", "ALL"].map((label) => (
                <span
                  key={label}
                  className={`rounded-full px-3 py-1 ${
                    label === "6M" ? "bg-white text-zinc-900 shadow-sm" : ""
                  }`}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-6">
            <div className="relative h-40">
              <div className="absolute inset-x-0 top-4 h-px bg-zinc-100" />
              <div className="absolute inset-x-0 top-1/2 h-px bg-zinc-100" />
              <div className="absolute inset-x-0 bottom-4 h-px bg-zinc-100" />
              <div className="flex h-full items-end gap-0">
                {chartData.map((item) => (
                  <div key={item.month} className="flex flex-1 flex-col items-center">
                    <div
                      className={`w-full rounded-t-xl ${
                        item.month === "Jul"
                          ? "bg-zinc-900"
                          : "bg-zinc-200"
                      }`}
                      style={{ height: `${item.value}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex justify-between text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-400">
              {chartData.map((item) => (
                <span key={item.month}>{item.month}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <Link href="/transactions" className="text-sm text-zinc-500">
              View All
            </Link>
          </div>
          <div className="mt-4 space-y-4">
            {recentActivity.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100">
                      <Icon className="h-5 w-5 text-zinc-700" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{item.name}</p>
                      <p className="text-xs text-zinc-500">{item.date}</p>
                    </div>
                  </div>
                  <p
                    className={`text-sm font-semibold ${item.amountClass} font-mono tabular-nums`}
                  >
                    {item.amount}
                  </p>
                </div>
              )
            })}
          </div>
        </section>

        <section className="relative mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 text-white shadow-sm">
          <p className="text-xs uppercase tracking-[0.35em] text-zinc-400">
            Savings Goal
          </p>
          <p className="mt-3 text-lg font-semibold">New Tesla Model S</p>
          <div className="mt-5 h-2 w-full rounded-full bg-white/20">
            <div className="h-2 w-2/3 rounded-full bg-white" />
          </div>
          <p className="mt-2 text-xs text-zinc-400">65% Completed</p>
          <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full border border-white/10" />
        </section>
      </div>

      <Button
        asChild
        size="icon"
        className="fixed bottom-24 right-6 h-12 w-12 rounded-full bg-zinc-900 text-white shadow-lg hover:bg-zinc-800"
        aria-label="Add transaction"
      >
        <Link href="/transactions/new">
          <Plus className="h-5 w-5" />
        </Link>
      </Button>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-sm items-center justify-between px-6 py-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.href === "/"
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.3em] ${
                  isActive ? "text-zinc-900" : "text-zinc-400"
                }`}
              >
                <span
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${
                    isActive ? "bg-zinc-100" : ""
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
