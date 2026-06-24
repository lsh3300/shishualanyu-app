import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface SectionHeaderProps {
  title: string
  href?: string
  className?: string
  showDecoration?: boolean
}

export function SectionHeader({ title, href, className, showDecoration = true }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-5", className)}>
      <div className="flex items-center gap-3">
        {/* 蓝染装饰条 */}
        {showDecoration && (
          <div className="relative">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-[#1e3a5f] via-[#4a90a4] to-[#87ceeb]" />
            <div className="absolute -top-0.5 -left-0.5 w-2 h-2 rounded-full bg-[#87ceeb] opacity-60 animate-pulse" />
          </div>
        )}
        <h2 className="text-lg md:text-xl font-bold text-foreground tracking-tight">{title}</h2>
      </div>
      {href && (
        <Link
          href={href}
          className="flex items-center text-sm text-muted-foreground hover:text-primary transition-all duration-200 group px-3 py-1.5 rounded-full hover:bg-primary/5"
        >
          <span>查看全部</span>
          <ChevronRight className="h-4 w-4 ml-0.5 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  )
}
