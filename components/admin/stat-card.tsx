'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { LucideIcon, TrendingDown, TrendingUp } from 'lucide-react'

interface StatCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  isLoading?: boolean
  className?: string
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  isLoading = false,
  className,
}: StatCardProps) {
  if (isLoading) {
    return (
      <Card className={cn('rounded-[24px] border-white/80 bg-white/88 shadow-[0_12px_28px_rgba(61,92,140,0.08)]', className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
            <Skeleton className="h-12 w-12 rounded-2xl" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        'rounded-[24px] border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.82)_0%,rgba(245,249,255,0.92)_100%)] shadow-[0_12px_28px_rgba(61,92,140,0.08)]',
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[12px] font-medium tracking-[0.08em] text-[#7890b1]">{title}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-[1.7rem] font-semibold leading-none text-[#243d66]">{value}</p>
              {trend ? (
                <span className={cn('flex items-center text-[11px] font-medium', trend.isPositive ? 'text-emerald-600' : 'text-rose-600')}>
                  {trend.isPositive ? <TrendingUp className="mr-0.5 h-3.5 w-3.5" /> : <TrendingDown className="mr-0.5 h-3.5 w-3.5" />}
                  {trend.value}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#e8f0fd_0%,#f5f9ff_100%)] text-[#44658f]">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
