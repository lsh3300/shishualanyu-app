import Link from "next/link"
import type { LucideIcon } from "lucide-react"

interface QuickAccessItem {
  href: string
  icon: LucideIcon
  label: string
  color?: string
}

interface QuickAccessProps {
  items: QuickAccessItem[]
}

export function QuickAccess({ items }: QuickAccessProps) {
  return (
    <div className="grid grid-cols-4 gap-4 sm:gap-6 px-4 py-4 max-w-3xl mx-auto">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-card hover:shadow-lg transition-all duration-300 group"
          >
            <div className={`p-3 sm:p-4 rounded-full ${item.color || "bg-primary/10"} shadow-sm transition-transform duration-300 group-hover:scale-110`}>
              <Icon className={`h-6 w-6 sm:h-7 sm:w-7 ${item.color ? "text-white" : "text-primary"} transition-transform duration-300 group-hover:rotate-12`} />
            </div>
            <span className="text-xs sm:text-sm font-medium text-center transition-colors duration-200 group-hover:text-primary">{item.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
