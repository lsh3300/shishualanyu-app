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
    <div className="flex justify-between gap-4 px-4 py-2">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-2 p-3.5 rounded-xl bg-card hover:shadow-md transition-all duration-300 flex-1 group"
          >
            <div className={`p-3 rounded-full ${item.color || "bg-primary/10"} shadow-sm transition-transform duration-300 group-hover:scale-105`}>
              <Icon className={`h-6 w-6 ${item.color ? "text-white" : "text-primary"} transition-transform duration-300 group-hover:rotate-12`} />
            </div>
            <span className="text-sm font-medium text-center transition-colors duration-200 group-hover:text-primary">{item.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
