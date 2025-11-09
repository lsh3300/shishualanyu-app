import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface SectionHeaderProps {
  title: string
  href?: string
  className?: string
}

export function SectionHeader({ title, href, className }: SectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">{title}</h2>
      {href && (
        <Link
          href={href}
          className="flex items-center text-sm text-muted-foreground hover:text-primary transition-all duration-200 group"
        >
          查看全部
          <ChevronRight className="h-4 w-4 ml-1 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  )
}
