'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { TrendDataPoint } from '@/types/admin.types'

interface TrendChartProps {
  title: string
  data: TrendDataPoint[]
  isLoading?: boolean
  className?: string
  color?: string
}

export function TrendChart({
  title,
  data,
  isLoading = false,
  className,
  color = 'hsl(var(--primary))',
}: TrendChartProps) {
  if (isLoading) {
    return (
      <Card className={cn('rounded-[24px] border-white/80 bg-white/88 shadow-[0_12px_28px_rgba(61,92,140,0.08)]', className)}>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-44 w-full rounded-2xl" />
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card className={cn('rounded-[24px] border-white/80 bg-white/88 shadow-[0_12px_28px_rgba(61,92,140,0.08)]', className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-[#264268]">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-44 items-center justify-center rounded-[20px] bg-slate-50/80 text-sm text-[#6f87aa]">
            暂无趋势数据
          </div>
        </CardContent>
      </Card>
    )
  }

  const maxValue = Math.max(...data.map((item) => item.count), 1)
  const chartHeight = 176
  const chartWidth = 100
  const padding = 14

  const points = data.map((item, index) => {
    const x = data.length === 1 ? chartWidth / 2 : (index / (data.length - 1)) * (chartWidth - padding * 2) + padding
    const y = chartHeight - (item.count / maxValue) * (chartHeight - padding * 2) - padding
    return { x, y, ...item }
  })

  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x}% ${point.y}`).join(' ')
  const areaPath = `${linePath} L ${points[points.length - 1].x}% ${chartHeight - padding} L ${points[0].x}% ${chartHeight - padding} Z`
  const total = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <Card
      className={cn(
        'rounded-[24px] border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.82)_0%,rgba(245,249,255,0.92)_100%)] shadow-[0_12px_28px_rgba(61,92,140,0.08)]',
        className
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-[#264268]">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-[20px] bg-[#f8fbff] p-3">
          <div className="relative" style={{ height: chartHeight }}>
            <svg className="h-full w-full" viewBox={`0 0 100 ${chartHeight}`} preserveAspectRatio="none">
              <defs>
                <linearGradient id={`chart-area-${title}`} x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor={color} stopOpacity="0.26" />
                  <stop offset="100%" stopColor={color} stopOpacity="0.04" />
                </linearGradient>
              </defs>

              <path d={areaPath} fill={`url(#chart-area-${title})`} />
              <path d={linePath} fill="none" stroke={color} strokeWidth={2.4} vectorEffect="non-scaling-stroke" strokeLinecap="round" />

              {points.map((point) => (
                <g key={`${point.date}-${point.count}`}>
                  <circle cx={`${point.x}%`} cy={point.y} r={4} fill="white" stroke={color} strokeWidth={2} />
                  <title>{`${point.date}: ${point.count}`}</title>
                </g>
              ))}
            </svg>

            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1 text-[11px] text-[#7f97ba]">
              {data.map((item, index) => (
                <span key={`${item.date}-${index}`} className={index !== 0 && index !== data.length - 1 ? 'hidden sm:inline' : ''}>
                  {formatDate(item.date)}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-white/90 px-3 py-2">
              <div className="text-[11px] uppercase tracking-[0.08em] text-[#7f97ba]">总计</div>
              <div className="mt-1 font-semibold text-[#264268]">{total}</div>
            </div>
            <div className="rounded-2xl bg-white/90 px-3 py-2">
              <div className="text-[11px] uppercase tracking-[0.08em] text-[#7f97ba]">日均</div>
              <div className="mt-1 font-semibold text-[#264268]">{(total / data.length).toFixed(1)}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}
