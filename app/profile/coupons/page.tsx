"use client"

import Link from "next/link"
import { ArrowRight, Gift, Info, Package, Sparkles, TicketPercent } from "lucide-react"

import { BottomNav } from "@/components/navigation/bottom-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ProfileSubpageHeader } from "@/components/ui/profile-subpage-header"
import { useAuth } from "@/contexts/auth-context"

const previewCoupons = [
  {
    title: "课程体验券",
    value: "满 99 减 20",
    tag: "教学",
    note: "后续适合用于课程活动、体验课和节日引流。",
    accent: "from-[#3d6ca8] to-[#6a93c8]",
  },
  {
    title: "文创折扣券",
    value: "9 折",
    tag: "商城",
    note: "后续可接入指定商品、指定时段或活动专题。",
    accent: "from-[#8b5a32] to-[#c38856]",
  },
  {
    title: "包邮券",
    value: "运费减免",
    tag: "订单",
    note: "后续更适合与订单金额、地区和实物商品联动。",
    accent: "from-[#2f7d74] to-[#62a89d]",
  },
]

export default function CouponsPage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="page-container">
        <ProfileSubpageHeader title="优惠券" subtitle="活动权益与订单抵扣" backHref="/profile" />

        <div className="flex flex-1 flex-col items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Card className="border-white/70 bg-white/82 shadow-[0_14px_34px_rgba(69,89,120,0.10)] backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <Gift className="mx-auto h-12 w-12 text-muted-foreground" />
                <h1 className="mt-4 text-2xl font-bold">优惠券</h1>
                <p className="mt-2 text-muted-foreground">登录后可查看优惠券入口预览，功能暂未正式开放。</p>
                <Link href={`/auth?view=login&redirectTo=${encodeURIComponent("/profile/coupons")}`}>
                  <Button className="mt-5 w-full">去登录</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        <BottomNav />
      </div>
    )
  }

  return (
    <div className="page-container page-background-home-echo pb-[calc(11rem+env(safe-area-inset-bottom,0px))]">
      <ProfileSubpageHeader title="优惠券" subtitle="活动权益与订单抵扣" backHref="/profile" />

      <main className="px-4 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] pt-2 space-y-5">
        <section className="overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,rgba(45,76,122,0.96),rgba(93,129,181,0.82)_60%,rgba(244,248,255,0.94)_100%)] p-5 text-white shadow-[0_18px_46px_rgba(57,80,119,0.18)]">
          <div className="max-w-md">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/14 px-3 py-1 text-[11px] tracking-[0.18em] text-white/88 ring-1 ring-white/16">
              <Sparkles className="h-3.5 w-3.5" />
              COUPON PREVIEW
            </div>
            <h2 className="text-[1.8rem] font-semibold leading-tight">
              页面先做好，
              <br />
              核销链路暂不开放
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/82">
              当前只保留优惠券展示入口，方便后续接入活动发放、订单抵扣、课程权益和结算联动。
            </p>
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/14 bg-white/10 px-4 py-3 backdrop-blur-sm">
            <Info className="h-5 w-5 shrink-0 text-white/92" />
            <p className="text-xs leading-5 text-white/80">
              现在不可领取、不可兑换、不可在结算页直接使用，先作为正式占位页保留。
            </p>
          </div>
        </section>

        <section className="space-y-3">
          {previewCoupons.map((coupon) => (
            <Card
              key={coupon.title}
              className="overflow-hidden border-white/70 bg-white/82 shadow-[0_14px_30px_rgba(69,89,120,0.10)] backdrop-blur-sm"
            >
              <CardContent className="p-0">
                <div className={`bg-gradient-to-r ${coupon.accent} px-5 py-4 text-white`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white/82">{coupon.tag}</p>
                      <h3 className="mt-1 text-lg font-semibold">{coupon.title}</h3>
                    </div>
                    <div className="rounded-full bg-white/16 p-2">
                      <TicketPercent className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="mt-4 text-2xl font-semibold tracking-[0.02em]">{coupon.value}</p>
                </div>
                <div className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <p className="text-sm text-slate-600">{coupon.note}</p>
                    <p className="mt-1 text-xs text-[#7b8fad]">状态：页面已预留，功能未完成</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#eef4fb] px-3 py-1 text-xs text-[#58759d]">暂不可用</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card className="border-white/70 bg-white/82 shadow-[0_12px_28px_rgba(69,89,120,0.08)] backdrop-blur-sm">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#edf4ff]">
                <Package className="h-5 w-5 text-[#496ea5]" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-medium text-slate-900">后续适合补齐的能力</h3>
                <ul className="mt-2 space-y-1 text-sm leading-6 text-slate-600">
                  <li>1. 领取与发放记录</li>
                  <li>2. 有效期、使用门槛、适用范围</li>
                  <li>3. 订单与结算页联动</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Link href="/store" className="flex-1">
            <Button className="h-11 w-full rounded-2xl bg-slate-900 hover:bg-slate-800">先去文创商城</Button>
          </Link>
          <Link href="/profile/settings" className="flex-1">
            <Button variant="outline" className="h-11 w-full rounded-2xl border-slate-200 bg-white/76">
              查看设置
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="h-12" aria-hidden="true" />
      </main>

      <BottomNav />
    </div>
  )
}
