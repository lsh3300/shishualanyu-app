"use client"

import { BottomNav } from "@/components/navigation/bottom-nav"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Beaker, BookOpen, Clock3, Layers3, PackageSearch } from "lucide-react"
import Link from "next/link"

const previewGroups = [
  {
    icon: Beaker,
    title: "染料与助剂",
    description: "后续会整理适合课堂、体验和进阶练习的常用材料组合。",
  },
  {
    icon: Layers3,
    title: "布料与半成品",
    description: "以后会按用途归类，方便快速找到练习布、围巾和衍生底料。",
  },
  {
    icon: PackageSearch,
    title: "入门工具",
    description: "会把基础工具整理成清晰套装，减少首次准备时的判断成本。",
  },
]

const currentNotes = [
  "当前页面先保持未开放状态，不提供下单、筛选和检索流程。",
  "后续更适合和教学课程联动，按课程所需材料直接跳转准备。",
  "如果只是想先了解内容，优先去教学页或文创商城更合理。",
]

export default function MaterialsPage() {
  return (
    <div className="page-container page-background-home-echo pb-36">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-3rem] top-20 h-44 w-44 rounded-full bg-sky-200/18 blur-3xl" />
        <div className="absolute bottom-24 right-[-2rem] h-40 w-40 rounded-full bg-amber-200/16 blur-3xl" />
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
              <p className="text-[11px] tracking-[0.24em] text-slate-500">MATERIAL TOOLS</p>
              <h1 className="text-xl font-semibold text-slate-900">材料工具</h1>
            </div>
          </div>

          <div className="rounded-full border border-sky-200/70 bg-white/70 px-3 py-1 text-[11px] text-sky-700 shadow-sm backdrop-blur-sm">
            筹备中
          </div>
        </div>
      </header>

      <main className="relative z-10 px-4 pb-6 pt-4">
        <section className="overflow-hidden rounded-[28px] border border-white/65 bg-[linear-gradient(135deg,rgba(255,255,255,0.90),rgba(244,247,252,0.78))] p-6 shadow-[0_18px_48px_rgba(74,90,120,0.10)] backdrop-blur-sm">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-[11px] text-sky-700 ring-1 ring-sky-100">
                <Clock3 className="h-3.5 w-3.5" />
                暂未开放购买
              </div>
              <h2 className="text-[1.75rem] font-semibold leading-tight text-slate-900">
                先把材料页做清楚，
                <br />
                再决定什么时候开放
              </h2>
              <p className="mt-3 max-w-md text-sm leading-7 text-slate-600">
                这一页先不做旧式商品流转，也不补假筛选。当前更适合把未来的材料结构、准备方向和入口关系说清楚。
              </p>
            </div>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#dff3ff,#f8fbff)] text-sky-700 shadow-inner ring-1 ring-white/80">
              <Beaker className="h-7 w-7" />
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-3">
          {previewGroups.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className="rounded-3xl border border-white/70 bg-white/76 p-4 shadow-[0_10px_28px_rgba(84,99,129,0.08)] backdrop-blur-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-700 ring-1 ring-slate-100">
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

        <section className="mt-5 rounded-[24px] border border-[#e7dcc8] bg-[linear-gradient(135deg,rgba(251,247,240,0.96),rgba(247,241,233,0.88))] p-5 shadow-[0_12px_32px_rgba(117,96,66,0.08)]">
          <div className="flex items-center gap-2 text-sm font-medium text-[#7d6647]">
            <BookOpen className="h-4 w-4" />
            当前处理方式
          </div>
          <div className="mt-4 space-y-3">
            {currentNotes.map((note, index) => (
              <div key={note} className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/80 text-xs font-semibold text-[#7d6647] ring-1 ring-[#eadfcf]">
                  {index + 1}
                </div>
                <p className="pt-0.5 text-sm leading-6 text-[#6c5a44]">{note}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-[24px] border border-white/70 bg-white/78 p-5 shadow-[0_10px_28px_rgba(84,99,129,0.08)] backdrop-blur-sm">
          <h3 className="text-base font-semibold text-slate-900">现在更适合去哪</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            如果老师或评委现在点进来，最好能直接看到已有内容，而不是被半成品流程拖住。
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/teaching">
              <Button className="rounded-full bg-slate-900 text-white hover:bg-slate-800">
                去看教学内容
              </Button>
            </Link>
            <Link href="/store">
              <Button variant="outline" className="rounded-full border-slate-200 bg-white/70">
                返回文创商城
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  )
}
