import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ProfileSubpageHeaderProps {
  title: string
  subtitle?: string
  backHref?: string
  backIcon?: LucideIcon
  rightSlot?: ReactNode
  className?: string
}

export function ProfileSubpageHeader({
  title,
  subtitle,
  backHref = "/profile",
  backIcon: BackIcon = ArrowLeft,
  rightSlot,
  className,
}: ProfileSubpageHeaderProps) {
  return (
    <header
      className={cn(
        "nav-header",
        className,
      )}
      data-testid="subpage-header"
    >
      <div className="px-4 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] pb-3">
        <div className="flex items-start gap-3">
          <Link href={backHref} aria-label="返回" data-testid="subpage-back">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-indigo-900/80 hover:bg-indigo-900/5"
            >
              <BackIcon className="h-5 w-5" />
            </Button>
          </Link>

          <div className="flex-1 min-w-0">
            <h1
              className="text-[17px] font-semibold text-indigo-950 tracking-[0.08em] leading-tight"
              style={{ fontFamily: "'Noto Serif SC', serif" }}
              data-testid="subpage-title"
            >
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-[11px] text-indigo-700/70 tracking-[0.22em] line-clamp-1">
                {subtitle}
              </p>
            )}
          </div>

          {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
        </div>

        <div className="mt-3 divider-indigo opacity-70" />
      </div>
    </header>
  )
}
