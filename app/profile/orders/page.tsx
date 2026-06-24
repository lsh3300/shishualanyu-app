"use client"

import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { CheckCircle2, Clock3, Loader2, Package, ShoppingBag, Truck } from "lucide-react"

import { BottomNav } from "@/components/navigation/bottom-nav"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ProfileSubpageHeader } from "@/components/ui/profile-subpage-header"
import { useAuth } from "@/contexts/auth-context"
import { useUserOrders } from "@/hooks/use-user-orders"

function getStatusMeta(status?: string | null) {
  switch (status) {
    case "delivered":
    case "completed":
      return {
        label: "已完成",
        icon: CheckCircle2,
        badgeClass: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      }
    case "shipped":
      return {
        label: "配送中",
        icon: Truck,
        badgeClass: "bg-sky-50 text-sky-700 ring-sky-200",
      }
    case "processing":
      return {
        label: "处理中",
        icon: Package,
        badgeClass: "bg-amber-50 text-amber-700 ring-amber-200",
      }
    default:
      return {
        label: "待付款",
        icon: Clock3,
        badgeClass: "bg-slate-100 text-slate-700 ring-slate-200",
      }
  }
}

function formatMoney(value?: number | string | null) {
  const amount = typeof value === "string" ? Number(value) : value ?? 0
  const safeAmount = Number.isFinite(amount) ? amount : 0
  return `¥${safeAmount.toFixed(2)}`
}

export default function OrdersPage() {
  const { user } = useAuth()
  const { ordersData, loading, error, refresh } = useUserOrders()

  if (!user) {
    return (
      <div className="page-container flex flex-col">
        <ProfileSubpageHeader title="我的订单" subtitle="查看订单状态与商品记录" backHref="/profile" />
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-24 text-center">
          <ShoppingBag className="mb-4 h-14 w-14 text-[#7d95b6]" />
          <h2 className="text-lg font-semibold text-[#243d66]">请先登录</h2>
          <p className="mt-2 max-w-[260px] text-sm leading-6 text-[#6d85a6]">
            登录后可以查看您的下单记录、商品清单与订单状态。
          </p>
          <Link href={`/auth?view=login&redirectTo=${encodeURIComponent("/profile/orders")}`}>
            <Button className="mt-6 rounded-full px-6">去登录</Button>
          </Link>
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="page-container flex flex-col page-background-home-echo">
      <ProfileSubpageHeader
        title="我的订单"
        subtitle="查看订单状态与商品记录"
        backHref="/profile"
        rightSlot={
          <div className="rounded-full bg-white/80 px-3 py-1 text-[11px] text-[#5f7ba2] ring-1 ring-[#d9e5f4]">
            共 {ordersData?.total ?? 0} 单
          </div>
        }
      />

      <section className="flex-1 px-4 pb-24">
        <div className="grid grid-cols-3 gap-3">
          <Card className="rounded-[20px] border-white/70 bg-white/72 shadow-[0_10px_24px_rgba(61,92,140,0.06)]">
            <CardContent className="px-4 py-3">
              <p className="text-[11px] text-[#7a91b2]">总订单</p>
              <p className="mt-1 text-lg font-semibold text-[#29446e]">{ordersData?.total ?? 0}</p>
            </CardContent>
          </Card>
          <Card className="rounded-[20px] border-white/70 bg-white/72 shadow-[0_10px_24px_rgba(61,92,140,0.06)]">
            <CardContent className="px-4 py-3">
              <p className="text-[11px] text-[#7a91b2]">处理中</p>
              <p className="mt-1 text-lg font-semibold text-[#29446e]">{ordersData?.pending ?? 0}</p>
            </CardContent>
          </Card>
          <Card className="rounded-[20px] border-white/70 bg-white/72 shadow-[0_10px_24px_rgba(61,92,140,0.06)]">
            <CardContent className="px-4 py-3">
              <p className="text-[11px] text-[#7a91b2]">已完成</p>
              <p className="mt-1 text-lg font-semibold text-[#29446e]">{ordersData?.completed ?? 0}</p>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="flex min-h-[52vh] flex-col items-center justify-center text-center">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-[#6d85a6]">正在加载订单记录</p>
          </div>
        ) : error ? (
          <Card className="mt-4 rounded-[24px] border-white/70 bg-white/72 shadow-[0_12px_28px_rgba(61,92,140,0.08)]">
            <CardContent className="flex min-h-[40vh] flex-col items-center justify-center text-center">
              <Package className="mb-4 h-12 w-12 text-[#8aa0bf]" />
              <h3 className="text-lg font-semibold text-[#243d66]">订单加载失败</h3>
              <p className="mt-2 max-w-[280px] text-sm leading-6 text-[#6d85a6]">{error.message}</p>
              <Button className="mt-6 rounded-full px-6" onClick={() => refresh()}>
                重新加载
              </Button>
            </CardContent>
          </Card>
        ) : (ordersData?.list.length ?? 0) > 0 ? (
          <div className="mt-4 space-y-4">
            {ordersData?.list.map((order) => {
              const statusMeta = getStatusMeta(order.status)
              const StatusIcon = statusMeta.icon
              const items = order.order_items || []
              const itemsCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0)

              return (
                <Card
                  key={order.id}
                  className="overflow-hidden rounded-[24px] border-white/75 bg-white/78 shadow-[0_12px_28px_rgba(61,92,140,0.08)]"
                >
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between border-b border-[#edf2f8] px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#2b466f]">
                          订单号 {order.order_number || order.id.slice(0, 8)}
                        </p>
                        <p className="mt-1 text-[11px] text-[#7a91b2]">
                          {order.created_at
                            ? format(new Date(order.created_at), "yyyy.MM.dd HH:mm", { locale: zhCN })
                            : "时间未记录"}
                        </p>
                      </div>
                      <Badge className={`rounded-full px-2.5 py-1 text-[11px] ring-1 ${statusMeta.badgeClass}`}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {statusMeta.label}
                      </Badge>
                    </div>

                    <div className="space-y-3 px-4 py-4">
                      {items.map((item) => {
                        const product = item.products
                        const image =
                          product?.image_url ||
                          (Array.isArray(product?.images) ? product?.images[0] : null) ||
                          "/placeholder.svg"

                        return (
                          <div key={item.id} className="flex items-center gap-3">
                            <div className="relative h-16 w-16 overflow-hidden rounded-[16px] bg-[#eef4fb]">
                              <Image src={image} alt={product?.name || "订单商品"} fill className="object-cover" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="line-clamp-2 text-sm font-medium text-[#29446e]">
                                {product?.name || "商品信息缺失"}
                              </p>
                              <div className="mt-2 flex items-center justify-between text-[12px] text-[#6d85a6]">
                                <span>x {item.quantity || 1}</span>
                                <span className="font-medium text-[#385988]">
                                  {formatMoney(item.price ?? product?.price)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="flex items-center justify-between bg-[#f8fbff] px-4 py-3 text-[12px] text-[#6882a8]">
                      <span>{itemsCount} 件商品</span>
                      <span className="text-sm font-semibold text-[#29446e]">
                        合计 {formatMoney(order.total_amount ?? order.total)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="flex min-h-[52vh] flex-col items-center justify-center text-center">
            <ShoppingBag className="mb-4 h-14 w-14 text-[#7d95b6]" />
            <h3 className="text-lg font-semibold text-[#243d66]">暂无订单</h3>
            <p className="mt-2 max-w-[260px] text-sm leading-6 text-[#6d85a6]">
              还没有下单记录，先去看看感兴趣的商品。
            </p>
            <Link href="/store">
              <Button className="mt-6 rounded-full px-6">去逛逛</Button>
            </Link>
          </div>
        )}
      </section>

      <BottomNav />
    </div>
  )
}
