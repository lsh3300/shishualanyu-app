'use client'

import { useCallback, useEffect, useState } from 'react'
import { BookOpen, FileCheck, RefreshCw, ShoppingBag, ShoppingCart, UserPlus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/admin/stat-card'
import { TrendChart } from '@/components/admin/trend-chart'
import { adminFetch } from '@/lib/admin-fetch'
import type { DashboardStats } from '@/types/admin.types'

const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchStats = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true)
    setError(null)

    try {
      const response = await adminFetch('/api/admin/stats')
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || '获取统计数据失败')
      }

      setStats(result.data)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取统计数据失败')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    const timer = setInterval(() => fetchStats(false), AUTO_REFRESH_INTERVAL)
    return () => clearInterval(timer)
  }, [fetchStats])

  if (error && !stats) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[24px] border border-rose-200 bg-rose-50/85 px-6 text-center">
        <p className="text-sm font-medium text-rose-700">{error}</p>
        <Button onClick={() => fetchStats(true)} variant="outline" className="mt-4 rounded-full">
          <RefreshCw className="mr-2 h-4 w-4" />
          重新加载
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[24px] border border-white/80 bg-[linear-gradient(135deg,rgba(232,241,253,0.88)_0%,rgba(247,250,255,0.78)_100%)] p-4 shadow-[0_12px_28px_rgba(61,92,140,0.08)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-[12px] font-medium tracking-[0.16em] text-[#6f89b0]">DASHBOARD</div>
            <h2
              className="mt-1 text-[1.35rem] font-semibold text-[#264268]"
              style={{ fontFamily: "'Noto Serif SC', serif" }}
            >
              后台总览
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#6f87aa]">
              这一页现在按手机演示框内的密度展示，方便毕业设计答辩时快速说明后台数据面板。
            </p>
          </div>

          <div className="flex flex-col items-start gap-2 sm:items-end">
            <div className="text-[12px] text-[#7c93b5]">
              {lastUpdated ? `最近更新于 ${lastUpdated.toLocaleTimeString('zh-CN')}` : '正在汇总当前业务数据'}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchStats(true)}
              disabled={isRefreshing}
              className="rounded-full border-[#d9e6f6] bg-white/90"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              刷新数据
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard title="用户总数" value={stats?.totalUsers ?? 0} icon={Users} isLoading={isLoading} />
        <StatCard
          title="今日新增用户"
          value={stats?.newUsersToday ?? 0}
          icon={UserPlus}
          trend={stats?.newUsersToday ? { value: stats.newUsersToday, isPositive: true } : undefined}
          isLoading={isLoading}
        />
        <StatCard title="课程总数" value={stats?.totalCourses ?? 0} icon={BookOpen} isLoading={isLoading} />
        <StatCard title="商品总数" value={stats?.totalProducts ?? 0} icon={ShoppingBag} isLoading={isLoading} />
        <StatCard title="订单总数" value={stats?.totalOrders ?? 0} icon={ShoppingCart} isLoading={isLoading} />
        <StatCard
          title="待审核内容"
          value={stats?.pendingReviews ?? 0}
          icon={FileCheck}
          trend={stats?.pendingReviews ? { value: stats.pendingReviews, isPositive: false } : undefined}
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-4">
        <TrendChart
          title="近 7 天用户注册趋势"
          data={stats?.userTrend ?? []}
          isLoading={isLoading}
          color="hsl(var(--primary))"
        />
        <TrendChart
          title="近 7 天订单趋势"
          data={stats?.orderTrend ?? []}
          isLoading={isLoading}
          color="hsl(157 62% 35%)"
        />
      </div>
    </div>
  )
}
