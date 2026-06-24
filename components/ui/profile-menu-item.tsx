import { ChevronRight, type LucideIcon } from "lucide-react"
import React from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ProfileMenuItemProps {
  href: string
  icon: LucideIcon
  title: string
  subtitle?: string
  showArrow?: boolean
  onClick?: () => void
  className?: string
  badge?: string | number
}

export function ProfileMenuItem({ href, icon: Icon, title, subtitle, showArrow = true, onClick, className, badge }: ProfileMenuItemProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault()
      onClick()
    }
  }

  return (
    <Link href={href} onClick={handleClick} className="block">
      <Card className={`p-4 hover:bg-muted/50 transition-all cursor-pointer border-0 shadow-sm ${className || ''}`}>
        <div className="flex items-center gap-4">
          <div className="p-2 bg-primary/10 rounded-lg transition-all group-hover:bg-primary/20">
            <Icon className="h-5 w-5 text-primary transition-transform group-hover:scale-110" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">{title}</h4>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {badge && (
            <Badge variant="destructive" className="h-5 px-2 text-xs">
              {badge}
            </Badge>
          )}
          {showArrow && <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />}
        </div>
      </Card>
    </Link>
  )
}
