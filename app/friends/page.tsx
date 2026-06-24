"use client"

import Link from "next/link"
import { Check, Loader2, MessageCircle, QrCode, UserPlus, UserRoundX, X } from "lucide-react"

import { BottomNav } from "@/components/navigation/bottom-nav"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ProfileSubpageHeader } from "@/components/ui/profile-subpage-header"
import { useAuth } from "@/contexts/auth-context"
import { useFriends } from "@/hooks/use-friends"
import { toast } from "@/hooks/use-toast"

function FriendAvatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  return (
    <Avatar className="h-12 w-12">
      <AvatarImage src={avatarUrl || undefined} alt={name} />
      <AvatarFallback>{name.charAt(0) || "友"}</AvatarFallback>
    </Avatar>
  )
}

export default function FriendsPage() {
  const { user } = useAuth()
  const { friends, incomingRequests, outgoingRequests, loading, error, updateFriendship } = useFriends()

  const handleAction = async (friendshipId: string, action: "accept" | "reject" | "cancel" | "remove") => {
    try {
      const result = await updateFriendship(friendshipId, action)
      toast({ title: result.message })
    } catch (err) {
      toast({
        title: "操作失败",
        description: err instanceof Error ? err.message : "请稍后再试。",
      })
    }
  }

  if (!user) {
    return (
      <div className="page-container flex min-h-screen flex-col page-background-home-echo">
        <ProfileSubpageHeader title="我的好友" subtitle="登录后查看好友和聊天" backHref="/profile" />
        <div className="flex flex-1 items-center px-4 pb-24">
          <Card className="w-full rounded-[24px] border-white/75 bg-white/82 shadow-[0_14px_30px_rgba(61,92,140,0.08)]">
            <CardContent className="px-6 py-8 text-center">
              <h2 className="text-[18px] font-semibold text-[#264268]">请先登录</h2>
              <p className="mt-2 text-[13px] leading-6 text-[#6d85a6]">登录后可以查看好友、处理申请，并进入 1 对 1 聊天。</p>
              <Button asChild className="mt-6 rounded-full px-6">
                <Link href="/auth?view=login&redirectTo=%2Ffriends">去登录</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="page-container flex min-h-screen flex-col page-background-home-echo">
      <ProfileSubpageHeader
        title="我的好友"
        subtitle="好友申请与聊天入口"
        backHref="/profile"
        rightSlot={
          <Button asChild variant="ghost" size="icon" className="rounded-full text-[#315a91] hover:bg-white/55">
            <Link href="/profile/scan">
              <QrCode className="h-5 w-5" />
            </Link>
          </Button>
        }
      />

      <div className="flex-1 px-4 pb-24">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-[20px] border border-white/70 bg-white/78 px-3 py-4 text-center shadow-[0_10px_22px_rgba(61,92,140,0.08)]">
            <div className="text-[11px] text-[#6d85a6]">好友</div>
            <div className="mt-1 text-[20px] font-semibold text-[#264268]">{friends.length}</div>
          </div>
          <div className="rounded-[20px] border border-white/70 bg-white/78 px-3 py-4 text-center shadow-[0_10px_22px_rgba(61,92,140,0.08)]">
            <div className="text-[11px] text-[#6d85a6]">待处理</div>
            <div className="mt-1 text-[20px] font-semibold text-[#264268]">{incomingRequests.length}</div>
          </div>
          <div className="rounded-[20px] border border-white/70 bg-white/78 px-3 py-4 text-center shadow-[0_10px_22px_rgba(61,92,140,0.08)]">
            <div className="text-[11px] text-[#6d85a6]">已发出</div>
            <div className="mt-1 text-[20px] font-semibold text-[#264268]">{outgoingRequests.length}</div>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-[#315a91]" />
            <p className="text-sm text-[#6d85a6]">正在同步好友数据</p>
          </div>
        ) : error ? (
          <div className="mt-4 rounded-[24px] border border-white/75 bg-white/82 p-6 text-center text-sm text-[#6d85a6] shadow-[0_14px_30px_rgba(61,92,140,0.08)]">
            {error}
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <section className="rounded-[24px] border border-white/75 bg-white/82 p-4 shadow-[0_14px_30px_rgba(61,92,140,0.08)]">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-[15px] font-semibold text-[#264268]">好友</h2>
                <span className="text-[12px] text-[#6d85a6]">{friends.length} 位</span>
              </div>
              <div className="space-y-3">
                {friends.length > 0 ? (
                  friends.map((friend) => (
                    <div key={friend.friendshipId} className="flex items-center gap-3 rounded-[18px] bg-[#f7fafe] px-3 py-3">
                      <FriendAvatar name={friend.fullName} avatarUrl={friend.avatarUrl} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[14px] font-medium text-[#264268]">{friend.fullName}</div>
                        <div className="mt-1 text-[11px] text-[#6d85a6]">
                          {friend.username ? `@${friend.username}` : "已建立好友关系"}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button asChild size="sm" className="rounded-full px-4">
                          <Link href={`/friends/${friend.id}`}>
                            <MessageCircle className="mr-1 h-4 w-4" />
                            聊天
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full text-[#8a5f5f] hover:bg-[#fff1f1]"
                          onClick={() => handleAction(friend.friendshipId, "remove")}
                        >
                          <UserRoundX className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[18px] bg-[#f7fafe] px-4 py-5 text-center text-[13px] text-[#6d85a6]">
                    还没有好友，去扫码页生成个人二维码或添加好友。
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[24px] border border-white/75 bg-white/82 p-4 shadow-[0_14px_30px_rgba(61,92,140,0.08)]">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-[15px] font-semibold text-[#264268]">收到的申请</h2>
                <span className="text-[12px] text-[#6d85a6]">{incomingRequests.length} 条</span>
              </div>
              <div className="space-y-3">
                {incomingRequests.length > 0 ? (
                  incomingRequests.map((friend) => (
                    <div key={friend.friendshipId} className="flex items-center gap-3 rounded-[18px] bg-[#f7fafe] px-3 py-3">
                      <FriendAvatar name={friend.fullName} avatarUrl={friend.avatarUrl} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[14px] font-medium text-[#264268]">{friend.fullName}</div>
                        <div className="mt-1 text-[11px] text-[#6d85a6]">等待你通过</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" className="rounded-full px-4" onClick={() => handleAction(friend.friendshipId, "accept")}>
                          <Check className="mr-1 h-4 w-4" />
                          通过
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-full px-4" onClick={() => handleAction(friend.friendshipId, "reject")}>
                          <X className="mr-1 h-4 w-4" />
                          拒绝
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[18px] bg-[#f7fafe] px-4 py-5 text-center text-[13px] text-[#6d85a6]">
                    暂时没有新的好友申请。
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[24px] border border-white/75 bg-white/82 p-4 shadow-[0_14px_30px_rgba(61,92,140,0.08)]">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-[15px] font-semibold text-[#264268]">已发出的申请</h2>
                <span className="text-[12px] text-[#6d85a6]">{outgoingRequests.length} 条</span>
              </div>
              <div className="space-y-3">
                {outgoingRequests.length > 0 ? (
                  outgoingRequests.map((friend) => (
                    <div key={friend.friendshipId} className="flex items-center gap-3 rounded-[18px] bg-[#f7fafe] px-3 py-3">
                      <FriendAvatar name={friend.fullName} avatarUrl={friend.avatarUrl} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[14px] font-medium text-[#264268]">{friend.fullName}</div>
                        <div className="mt-1 text-[11px] text-[#6d85a6]">等待对方确认</div>
                      </div>
                      <Button variant="outline" size="sm" className="rounded-full px-4" onClick={() => handleAction(friend.friendshipId, "cancel")}>
                        撤回
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[18px] bg-[#f7fafe] px-4 py-5 text-center text-[13px] text-[#6d85a6]">
                    没有待确认的申请。
                  </div>
                )}
              </div>
            </section>

            <Button asChild variant="outline" className="w-full rounded-full">
              <Link href="/profile/scan">
                <UserPlus className="mr-2 h-4 w-4" />
                去添加好友
              </Link>
            </Button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

