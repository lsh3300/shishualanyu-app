"use client"

import { BottomNav } from "@/components/navigation/bottom-nav"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Compass, Palette, ScrollText, Sparkles, Users2 } from "lucide-react"
import Link from "next/link"

const previewBlocks = [
  {
    icon: Palette,
    title: "定制方向",
    description: "后续更适合承接礼品、课程衍生、空间陈列等更明确的定制需求。",
  },
  {
    icon: ScrollText,
    title: "沟通方式",
    description: "后续需要把需求说明、风格确认和交付边界整理成真正可执行的流程。",
  },
  {
    icon: Users2,
    title: "服务准备",
    description: "工坊、材料、案例和排期都还没整理完，现在还不适合对外当成正式功能。",
  },
]

const customSteps = [
  {
    title: "先说明需求场景",
    description: "是课程活动、纪念礼品，还是空间展示，后续入口应该先按场景区分。",
  },
  {
    title: "再确认工艺与数量",
    description: "不同工艺和批量会直接影响周期、单价和交付方式。",
  },
  {
    title: "最后再开放正式提交",
    description: "没有把前两步梳理清楚之前，不应该直接做下单页和报价页。",
  },
]

export default function CustomWorkshopPage() {
  return (
    <div className="page-container page-background-home-echo pb-36">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-0 top-24 h-52 w-52 rounded-full bg-violet-200/16 blur-3xl" />
        <div className="absolute bottom-28 right-[-2rem] h-44 w-44 rounded-full bg-sky-200/14 blur-3xl" />
      </div>

      <header className="nav-header shadow-sm">
        <div className="flex items-center justify-between px-5 pb-3 pt-3">
          <div className="flex items-center gap-3">
            <Link
              href="/store"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/72 text-slate-700 shadow-sm ring-1 ring-black/5 backdrop-blur-sm transition-colors hover:bg-white/88"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <p className="text-[11px] tracking-[0.24em] text-slate-500">CUSTOM WORKSHOP</p>
              <h1 className="text-xl font-semibold text-slate-900">定制工坊</h1>
            </div>
          </div>

          <div className="rounded-full border border-violet-200/70 bg-white/70 px-3 py-1 text-[11px] text-violet-700 shadow-sm backdrop-blur-sm">
            未开放
          </div>
        </div>
      </header>

      <main className="relative z-10 px-4 pb-6 pt-4">
        <section className="overflow-hidden rounded-[30px] border border-white/65 bg-[linear-gradient(135deg,rgba(38,45,82,0.96),rgba(73,84,130,0.88)_54%,rgba(245,247,252,0.94)_100%)] p-6 shadow-[0_20px_56px_rgba(56,66,101,0.18)]">
          <div className="max-w-md">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/14 px-3 py-1 text-[11px] tracking-[0.18em] text-white/88 ring-1 ring-white/16">
              <Sparkles className="h-3.5 w-3.5" />
              CUSTOM PREVIEW
            </div>
            <h2 className="text-[1.9rem] font-semibold leading-tight text-white">
              页面先升级，
              <br />
              功能继续暂缓开放
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/80">
              定制工坊现在更适合作为概念展示入口，而不是伪装成已经能接单的完整业务页。这样更真实，也更利于评审理解产品边界。
            </p>
          </div>

          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/14 text-white">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">当前状态</p>
              <p className="mt-0.5 text-xs leading-5 text-white/72">
                保留入口，不开放报价、预约、提单和案例成交链路。
              </p>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-3">
          {previewBlocks.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className="rounded-3xl border border-white/70 bg-white/78 p-4 shadow-[0_10px_28px_rgba(84,99,129,0.08)] backdrop-blur-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-700 ring-1 ring-violet-100">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </section>

        <section className="mt-5 rounded-[24px] border border-[#dfd7f4] bg-[linear-gradient(135deg,rgba(247,244,255,0.98),rgba(242,248,255,0.90))] p-5 shadow-[0_12px_30px_rgba(86,85,142,0.10)]">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-violet-800">
            <ScrollText className="h-4 w-4" />
            更合理的上线顺序
          </div>
          <div className="space-y-3">
            {customSteps.map((step, index) => (
              <div key={step.title} className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-violet-700 ring-1 ring-violet-100">
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-[24px] border border-white/70 bg-white/78 p-5 shadow-[0_10px_28px_rgba(84,99,129,0.08)] backdrop-blur-sm">
          <h3 className="text-base font-semibold text-slate-900">当前建议入口</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            在工坊能力还没整理完之前，让用户先回到已有内容页，比堆一页半假的服务模块更稳妥。
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/store">
              <Button className="rounded-full bg-slate-900 text-white hover:bg-slate-800">
                返回文创商城
              </Button>
            </Link>
            <Link href="/teaching">
              <Button variant="outline" className="rounded-full border-slate-200 bg-white/70">
                先看教学内容
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  )
}

