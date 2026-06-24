"use client";

import Link from "next/link";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import {
  Archive,
  Brush,
  CheckCircle2,
  FileText,
  Loader2,
  Palette,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import { BottomNav } from "@/components/navigation/bottom-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProfileSubpageHeader } from "@/components/ui/profile-subpage-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";
import { useUserAssignments, type UserAssignmentRecord, type UserCreationStatus } from "@/hooks/use-user-assignments";

function formatDate(value?: string | null, fallback = "暂无记录") {
  if (!value) return fallback;

  try {
    return format(new Date(value), "yyyy.MM.dd HH:mm", { locale: zhCN });
  } catch {
    return value;
  }
}

function getStatusMeta(status: UserCreationStatus) {
  switch (status) {
    case "completed":
      return {
        label: "已完成",
        icon: CheckCircle2,
        className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      };
    case "listed":
      return {
        label: "在售中",
        icon: ShoppingBag,
        className: "bg-violet-50 text-violet-700 ring-violet-200",
      };
    case "sold":
      return {
        label: "已售出",
        icon: Archive,
        className: "bg-amber-50 text-amber-700 ring-amber-200",
      };
    default:
      return {
        label: "创作中",
        icon: Brush,
        className: "bg-sky-50 text-sky-700 ring-sky-200",
      };
  }
}

function getSlotLabel(slotType: UserAssignmentRecord["slotType"]) {
  if (slotType === "recent") return "最近创作";
  if (slotType === "inventory") return "作品库";
  return "未归档";
}

function CreationCard({ item }: { item: UserAssignmentRecord }) {
  const statusMeta = getStatusMeta(item.status);
  const StatusIcon = statusMeta.icon;

  return (
    <Card className="overflow-hidden rounded-[20px] border-white/75 bg-white/78 shadow-[0_8px_20px_rgba(61,92,140,0.06)]">
      <CardContent className="p-3.5">
        <div className="flex items-start gap-3">
          <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-[16px] bg-[linear-gradient(135deg,#e7f0fb_0%,#f6f9fe_100%)] text-[#416997] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
            <Palette className="h-7 w-7" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-[14px] font-semibold text-[#29446e]">{item.title}</h3>
                <p className="mt-0.5 text-[11px] text-[#6f87aa]">{getSlotLabel(item.slotType)}</p>
              </div>
              <Badge className={`rounded-full px-2.5 py-1 text-[10px] ring-1 ${statusMeta.className}`}>
                <StatusIcon className="mr-1 h-3 w-3" />
                {statusMeta.label}
              </Badge>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-[#6d85a6]">
              <div>图层 {item.layerCount}</div>
              <div>评分 {item.totalScore ?? "--"}</div>
              <div>等级 {item.grade ?? "--"}</div>
              <div>创建于 {formatDate(item.createdAt, "--")}</div>
            </div>

            <div className="mt-2 border-t border-[#edf2f8] pt-2 text-[11px] text-[#8aa0bf]">
              {item.status === "draft"
                ? `最近编辑 ${formatDate(item.updatedAt, "暂无记录")}`
                : `完成时间 ${formatDate(item.completedAt, "暂无记录")}`}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AssignmentsPage() {
  const { user, loading: authLoading } = useAuth();
  const { assignmentsData, loading, error, refresh } = useUserAssignments();

  if (authLoading) {
    return (
      <div className="page-container flex flex-col">
        <ProfileSubpageHeader title="我的创作" subtitle="查看作品草稿与完成记录" backHref="/profile" />
        <div className="flex flex-1 items-center justify-center p-4 text-sm text-muted-foreground">加载中...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 p-4 flex flex-col items-center justify-center">
          <div className="w-full max-w-md">
            <Card className="p-8 text-center">
              <div className="mb-6">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                <h1 className="text-2xl font-bold mt-4">我的创作</h1>
                <p className="text-muted-foreground mt-2">登录后可以查看您的创作草稿和完成作品</p>
              </div>
              <Link href={`/auth?view=login&redirectTo=${encodeURIComponent("/profile/assignments")}`}>
                <Button className="w-full">去登录</Button>
              </Link>
            </Card>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  const allItems = assignmentsData?.list ?? [];
  const draftItems = allItems.filter((item) => item.status === "draft");
  const completedItems = allItems.filter((item) => item.status !== "draft");

  return (
    <div className="page-container flex flex-col page-background-home-echo">
      <ProfileSubpageHeader
        title="我的创作"
        subtitle="查看作品草稿与完成记录"
        backHref="/profile"
        rightSlot={
          <div className="rounded-full bg-white/80 px-3 py-1 text-[11px] text-[#5f7ba2] ring-1 ring-[#d9e5f4]">
            共 {assignmentsData?.total ?? 0} 条
          </div>
        }
      />

      <section className="flex-1 px-4 pb-24">
        <div className="grid grid-cols-3 gap-2.5">
          <Card className="rounded-[18px] border-white/70 bg-white/72 shadow-[0_8px_18px_rgba(61,92,140,0.05)]">
            <CardContent className="px-3.5 py-2.5">
              <p className="text-[11px] text-[#7a91b2]">创作总数</p>
              <p className="mt-0.5 text-[15px] font-semibold text-[#29446e]">{assignmentsData?.total ?? 0}</p>
            </CardContent>
          </Card>
          <Card className="rounded-[18px] border-white/70 bg-white/72 shadow-[0_8px_18px_rgba(61,92,140,0.05)]">
            <CardContent className="px-3.5 py-2.5">
              <p className="text-[11px] text-[#7a91b2]">创作中</p>
              <p className="mt-0.5 text-[15px] font-semibold text-[#29446e]">{assignmentsData?.draftCount ?? 0}</p>
            </CardContent>
          </Card>
          <Card className="rounded-[18px] border-white/70 bg-white/72 shadow-[0_8px_18px_rgba(61,92,140,0.05)]">
            <CardContent className="px-3.5 py-2.5">
              <p className="text-[11px] text-[#7a91b2]">已完成</p>
              <p className="mt-0.5 text-[15px] font-semibold text-[#29446e]">{assignmentsData?.completedCount ?? 0}</p>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="flex min-h-[52vh] flex-col items-center justify-center text-center">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-[#6d85a6]">正在加载创作记录</p>
          </div>
        ) : error ? (
          <Card className="mt-4 rounded-[24px] border-white/70 bg-white/72 shadow-[0_12px_28px_rgba(61,92,140,0.08)]">
            <CardContent className="flex min-h-[40vh] flex-col items-center justify-center text-center">
              <Sparkles className="mb-4 h-12 w-12 text-[#8aa0bf]" />
              <h3 className="text-lg font-semibold text-[#243d66]">创作记录加载失败</h3>
              <p className="mt-2 max-w-[280px] text-sm leading-6 text-[#6d85a6]">{error.message}</p>
              <Button className="mt-6 rounded-full px-6" onClick={() => refresh()}>
                重新加载
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="draft" className="mt-3">
            <TabsList className="grid h-auto grid-cols-2 rounded-full bg-[#eef4fb] p-1">
              <TabsTrigger value="draft" className="rounded-full text-[12px] data-[state=active]:bg-white">
                创作中 ({draftItems.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="rounded-full text-[12px] data-[state=active]:bg-white">
                已完成 ({completedItems.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="draft" className="mt-3">
              {draftItems.length > 0 ? (
                <div className="space-y-2.5">
                  {draftItems.map((item) => (
                    <CreationCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="flex min-h-[42vh] flex-col items-center justify-center text-center">
                  <Brush className="mb-4 h-14 w-14 text-[#7d95b6]" />
                  <h3 className="text-lg font-semibold text-[#243d66]">暂无创作中的作品</h3>
                  <p className="mt-2 max-w-[260px] text-sm leading-6 text-[#6d85a6]">
                    还没有草稿作品，去工坊完成一件新的蓝染创作。
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="mt-3">
              {completedItems.length > 0 ? (
                <div className="space-y-2.5">
                  {completedItems.map((item) => (
                    <CreationCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="flex min-h-[42vh] flex-col items-center justify-center text-center">
                  <CheckCircle2 className="mb-4 h-14 w-14 text-[#7d95b6]" />
                  <h3 className="text-lg font-semibold text-[#243d66]">暂无已完成作品</h3>
                  <p className="mt-2 max-w-[260px] text-sm leading-6 text-[#6d85a6]">
                    完成并评分后的作品会自动显示在这里。
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </section>

      <BottomNav />
    </div>
  );
}
