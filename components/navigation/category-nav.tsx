"use client"

import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface CategoryNavProps {
  categories: Array<{
    id: string
    label: string
    href: string
  }>
  className?: string
}

export function CategoryNav({ categories, className }: CategoryNavProps) {
  const pathname = usePathname()

  return (
    <nav className={cn("flex items-center space-x-2 text-sm", className)}>
      {categories.map((category, index) => (
        <div key={category.id} className="flex items-center">
          {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />}
          <Link
            href={category.href}
            className={cn(
              "transition-colors",
              pathname === category.href
                ? "text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {category.label}
          </Link>
        </div>
      ))}
    </nav>
  )
}