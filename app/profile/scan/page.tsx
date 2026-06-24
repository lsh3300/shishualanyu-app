"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Copy, Loader2, MessageCircle, QrCode, ScanLine, UserPlus } from "lucide-react"

import { BottomNav } from "@/components/navigation/bottom-nav"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ProfileSubpageHeader } from "@/components/ui/profile-subpage-header"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { useFriends } from "@/hooks/use-friends"
import { toast } from "@/hooks/use-toast"
import { useUserProfile } from "@/hooks/use-user-profile"
import { extractFriendUserId, shortenUserId } from "@/lib/friends"

export default function ProfileScanPage() {
  const searchParams = useSearchParams()
  const addValue = searchParams.get("add") || ""
  const { user } = useAuth()
  const { profile } = useUserProfile()
  const { lookupCandidate, sendRequest, updateFriendship } = useFriends()
  const [activeTab, setActiveTab] = useState(addValue ? "add" : "my-code")
  const [origin, setOrigin] = useState("")
  const [qrDataUrl, setQrDataUrl] = useState("")
  const [lookupInput, setLookupInput] = useState(addValue)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupResult, setLookupResult] = useState<Awaited<ReturnType<typeof lookupCandidate>> | null>(null)

  const displayName = profile?.full_name || user?.user_metadata?.display_name || user?.email?.split("@")[0] || "世说蓝语用户"
  const qrLink = useMemo(() => {
    if (!origin || !user?.id) return ""
    return `${origin}/profile/scan?add=${user.id}`
  }, [origin, user?.id])

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin)
    }
  }, [])

  useEffect(() => {
    if (!qrLink) {
      setQrDataUrl("")
      return
    }

    let cancelled = false

    import("qrcode")
      .then((module) => module.toDataURL(qrLink, { margin: 1, width: 360 }))
      .then((dataUrl) => {
        if (!cancelled) {
          setQrDataUrl(dataUrl)
        }
      })
      .catch((error) => {
        console.error("Failed to generate QR code:", error)
      })

    return () => {
      cancelled = true
    }
  }, [qrLink])

  useEffect(() => {
    if (!user || !addValue) return
    handleLookup(addValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addValue, user])

  const copyText = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value)
      toast({ title: `${label}已复制` })
    } catch {
      toast({ title: "复制失败", description: "请手动长按复制。" })
    }
  }

  async function handleLookup(rawValue?: string) {
    const nextValue = rawValue ?? lookupInput
    const targetUserId = extractFriendUserId(nextValue)
    if (!targetUserId) {
      toast({
        title: "识别失败",
        description: "请输入好友二维码链接或完整用户 ID。",
      })
      return
    }

    try {
      setLookupLoading(true)
      const result = await lookupCandidate(targetUserId)
      setLookupResult(result)
      setLookupInput(nextValue)
    } catch (err) {
      toast({
        title: "查询失败",
        description: err instanceof Error ? err.message : "请稍后再试。",
      })
      setLookupResult(null)
    } finally {
      setLookupLoading(false)
    }
  }

  const handleSendRequest = async () => {
    if (!lookupResult?.candidate) return
    try {
      const result = await sendRequest(lookupResult.candidate.id)
      toast({ title: result.message })
      await handleLookup(lookupResult.candidate.id)
    } catch (err) {
      toast({
        title: "发送失败",
        description: err instanceof Error ? err.message : "请稍后再试。",
      })
    }
  }

  const handleAccept = async () => {
    if (!lookupResult?.relation.friendshipId) return
    try {
      const result = await updateFriendship(lookupResult.relation.friendshipId, "accept")
      toast({ title: result.message })
      await handleLookup(lookupResult.candidate?.id || lookupInput)
    } catch (err) {
      toast({
        title: "处理失败",
        description: err instanceof Error ? err.message : "请稍后再试。",
      })
    }
  }

  return (
    <div className="page-container flex min-h-screen flex-col page-background-home-echo">
      <ProfileSubpageHeader
        title="好友二维码"
        subtitle="展示个人二维码并通过链接加好友"
        backHref="/profile"
        rightSlot={
          <Button asChild variant="ghost" size="icon" className="rounded-full text-[#315a91] hover:bg-white/55">
            <Link href="/friends">
              <MessageCircle className="h-5 w-5" />
            </Link>
          </Button>
        }
      />

      <div className="flex-1 px-4 pb-24">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid h-auto grid-cols-2 rounded-full bg-white/74 p-1 shadow-[0_10px_24px_rgba(61,92,140,0.08)]">
            <TabsTrigger value="my-code" className="rounded-full text-[13px]">我的二维码</TabsTrigger>
            <TabsTrigger value="add" className="rounded-full text-[13px]">加好友</TabsTrigger>
          </TabsList>
        </Tabs>

        {activeTab === "my-code" ? (
          <section className="mt-4">
            {!user ? (
              <Card className="rounded-[26px] border-white/75 bg-white/82 shadow-[0_14px_30px_rgba(61,92,140,0.08)]">
                <CardContent className="px-6 py-8 text-center">
                  <h2 className="text-[18px] font-semibold text-[#264268]">请先登录</h2>
                  <p className="mt-2 text-[13px] leading-6 text-[#6d85a6]">登录后才能生成你的专属二维码，让别人扫码加你。</p>
                  <Button asChild className="mt-6 rounded-full px-6">
                    <Link href="/auth?view=login&redirectTo=%2Fprofile%2Fscan">去登录</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="rounded-[26px] border-white/75 bg-white/82 shadow-[0_14px_30px_rgba(61,92,140,0.08)]">
                <CardContent className="px-6 py-7 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[linear-gradient(135deg,#edf4ff_0%,#f7fbff_100%)]">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
                      <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>

                  <h1 className="mt-4 text-[20px] font-semibold text-[#264268]">{displayName}</h1>
                  <p className="mt-1 text-[12px] text-[#6d85a6]">{shortenUserId(user.id)}</p>

                  <div className="mx-auto mt-6 w-full max-w-[280px] rounded-[28px] bg-white p-4 shadow-[inset_0_0_0_1px_rgba(224,233,245,0.9)]">
                    {qrDataUrl ? (
                      <img src={qrDataUrl} alt="个人二维码" className="mx-auto h-full w-full rounded-[18px]" />
                    ) : (
                      <div className="flex aspect-square items-center justify-center rounded-[18px] bg-[#f5f8fd] text-[#6d85a6]">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="mt-6 space-y-2 rounded-[20px] bg-[#f6f9fd] p-4 text-left text-[13px] leading-6 text-[#617b9f]">
                    <div className="flex items-start gap-2">
                      <QrCode className="mt-0.5 h-4 w-4 shrink-0 text-[#5278a7]" />
                      <span>别人扫描这个二维码后，会直接打开当前页面并识别你的好友链接。</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <ScanLine className="mt-0.5 h-4 w-4 shrink-0 text-[#5278a7]" />
                      <span>当前版本采用“扫码打开链接加好友”，不依赖站内摄像头，链路更稳。</span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <Button variant="outline" className="rounded-full" onClick={() => copyText(qrLink, "二维码链接")}>
                      <Copy className="mr-2 h-4 w-4" />
                      复制链接
                    </Button>
                    <Button variant="outline" className="rounded-full" onClick={() => copyText(user.id, "好友 ID")}>
                      <Copy className="mr-2 h-4 w-4" />
                      复制 ID
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </section>
        ) : (
          <section className="mt-4 space-y-4">
            <Card className="rounded-[26px] border-white/75 bg-white/82 shadow-[0_14px_30px_rgba(61,92,140,0.08)]">
              <CardContent className="px-6 py-6">
                <h2 className="text-[18px] font-semibold text-[#264268]">识别好友二维码链接</h2>
                <p className="mt-2 text-[13px] leading-6 text-[#6d85a6]">
                  扫码后如果浏览器打开了本页，会自动识别。也可以把链接或用户 ID 粘贴到下面手动查询。
                </p>

                <div className="mt-5 flex items-center gap-2">
                  <Input
                    value={lookupInput}
                    onChange={(e) => setLookupInput(e.target.value)}
                    placeholder="粘贴二维码链接或好友 ID"
                    className="rounded-full border-[#dbe6f4] bg-white"
                  />
                  <Button className="rounded-full px-5" onClick={() => handleLookup()} disabled={lookupLoading}>
                    {lookupLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "识别"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {!user ? (
              <Card className="rounded-[26px] border-white/75 bg-white/82 shadow-[0_14px_30px_rgba(61,92,140,0.08)]">
                <CardContent className="px-6 py-7 text-center">
                  <h3 className="text-[16px] font-semibold text-[#264268]">登录后才能加好友</h3>
                  <p className="mt-2 text-[13px] leading-6 text-[#6d85a6]">登录后再处理当前二维码链接，好友关系会真实写入后端。</p>
                  <Button asChild className="mt-5 rounded-full px-6">
                    <Link href={`/auth?view=login&redirectTo=${encodeURIComponent(`/profile/scan${addValue ? `?add=${addValue}` : ""}`)}`}>
                      去登录
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : lookupResult?.candidate ? (
              <Card className="rounded-[26px] border-white/75 bg-white/82 shadow-[0_14px_30px_rgba(61,92,140,0.08)]">
                <CardContent className="px-6 py-6">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={lookupResult.candidate.avatarUrl || undefined} alt={lookupResult.candidate.fullName} />
                      <AvatarFallback>{lookupResult.candidate.fullName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[16px] font-semibold text-[#264268]">{lookupResult.candidate.fullName}</div>
                      <div className="mt-1 text-[12px] text-[#6d85a6]">
                        {lookupResult.candidate.username ? `@${lookupResult.candidate.username}` : shortenUserId(lookupResult.candidate.id)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-[18px] bg-[#f7fafe] px-4 py-4 text-[13px] text-[#617b9f]">
                    {lookupResult.relation.state === "self" && "这是你自己的二维码。"}
                    {lookupResult.relation.state === "none" && "可以发送好友申请。"}
                    {lookupResult.relation.state === "incoming" && "对方已经向你发来好友申请，可以直接通过。"}
                    {lookupResult.relation.state === "outgoing" && "好友申请已发出，等待对方确认。"}
                    {lookupResult.relation.state === "accepted" && "你们已经是好友了，可以直接聊天。"}
                    {lookupResult.relation.state === "rejected" && "曾经拒绝过这条申请，现在可以重新发起。"}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    {lookupResult.relation.state === "none" || lookupResult.relation.state === "rejected" ? (
                      <Button className="rounded-full px-5" onClick={handleSendRequest}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        发送好友申请
                      </Button>
                    ) : null}

                    {lookupResult.relation.state === "incoming" && lookupResult.relation.friendshipId ? (
                      <Button className="rounded-full px-5" onClick={handleAccept}>
                        通过好友申请
                      </Button>
                    ) : null}

                    {lookupResult.relation.state === "accepted" ? (
                      <Button asChild className="rounded-full px-5">
                        <Link href={`/friends/${lookupResult.candidate.id}`}>
                          <MessageCircle className="mr-2 h-4 w-4" />
                          去聊天
                        </Link>
                      </Button>
                    ) : null}

                    <Button asChild variant="outline" className="rounded-full px-5">
                      <Link href="/friends">查看好友列表</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="rounded-[26px] border-white/75 bg-white/82 shadow-[0_14px_30px_rgba(61,92,140,0.08)]">
                <CardContent className="px-6 py-7 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[linear-gradient(135deg,#edf4ff_0%,#f7fbff_100%)] text-[#315a91]">
                    <ScanLine className="h-7 w-7" />
                  </div>
                  <h3 className="mt-4 text-[17px] font-semibold text-[#264268]">等待识别好友</h3>
                  <p className="mt-2 text-[13px] leading-6 text-[#6d85a6]">
                    扫描二维码后如果打开了本页，系统会直接带出好友信息；也支持手动粘贴链接或 ID。
                  </p>
                </CardContent>
              </Card>
            )}

            <Button asChild variant="outline" className="w-full rounded-full">
              <Link href="/friends">
                <MessageCircle className="mr-2 h-4 w-4" />
                打开好友列表
              </Link>
            </Button>
          </section>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

