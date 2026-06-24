"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Loader2, Send } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
import { fetchJson, HttpError } from "@/lib/fetch-json"
import { cn } from "@/lib/utils"

type ConversationMessage = {
  id: string
  senderId: string
  receiverId: string
  content: string
  isRead: boolean
  timestamp: string
}

type ChatPayload = {
  peer: {
    id: string
    fullName: string
    username: string
    avatarUrl: string | null
  } | null
  conversation: ConversationMessage[]
}

export default function FriendChatPage() {
  const params = useParams<{ id: string }>()
  const peerId = typeof params?.id === "string" ? params.id : ""
  const { user, getToken } = useAuth()
  const [peer, setPeer] = useState<ChatPayload["peer"]>(null)
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [draft, setDraft] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement | null>(null)

  const authedFetch = useCallback(
    async <T,>(url: string, init?: RequestInit) => {
      const token = await getToken()
      if (!token) {
        throw new HttpError("Unauthorized", 401)
      }

      return fetchJson<T>(url, {
        ...init,
        headers: {
          ...(init?.headers || {}),
          Authorization: `Bearer ${token}`,
        },
      })
    },
    [getToken],
  )

  const loadConversation = useCallback(async () => {
    if (!user || !peerId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await authedFetch<ChatPayload>(`/api/messages?peerId=${encodeURIComponent(peerId)}`)
      setPeer(data.peer)
      setMessages(data.conversation || [])

      await authedFetch("/api/messages", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ peerId }),
      })
    } catch (err) {
      console.error("Failed to load conversation:", err)
      setError(err instanceof Error ? err.message : "加载聊天失败")
    } finally {
      setLoading(false)
    }
  }, [authedFetch, peerId, user])

  useEffect(() => {
    loadConversation()
  }, [loadConversation])

  useEffect(() => {
    if (!user || !peerId) return
    const timer = window.setInterval(() => {
      loadConversation()
    }, 6000)

    return () => window.clearInterval(timer)
  }, [loadConversation, peerId, user])

  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector("[data-radix-scroll-area-viewport]")
    if (viewport instanceof HTMLDivElement) {
      viewport.scrollTop = viewport.scrollHeight
    }
  }, [messages.length])

  const handleSend = async () => {
    const content = draft.trim()
    if (!content || !peerId) return

    try {
      setSending(true)
      await authedFetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ receiverId: peerId, content }),
      })
      setDraft("")
      await loadConversation()
    } catch (err) {
      toast({
        title: "发送失败",
        description: err instanceof Error ? err.message : "请稍后再试",
      })
    } finally {
      setSending(false)
    }
  }

  const title = peer?.fullName || "好友聊天"

  if (!user) {
    return (
      <div className="page-container flex min-h-screen flex-col page-background-home-echo">
        <div className="px-4 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)]">
          <Link href="/friends" className="inline-flex items-center gap-2 text-sm text-[#315a91]">
            <ArrowLeft className="h-4 w-4" />
            返回好友列表
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-[#6d85a6]">
          登录后才能进入聊天。
        </div>
      </div>
    )
  }

  return (
    <div className="page-container flex min-h-screen flex-col page-background-home-echo">
      <header className="px-4 pb-3 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)]">
        <div className="flex items-center gap-3 rounded-[22px] border border-white/75 bg-white/82 px-4 py-3 shadow-[0_14px_30px_rgba(61,92,140,0.08)]">
          <Link href="/friends" className="rounded-full p-2 text-[#315a91] hover:bg-[#f3f7fd]">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <Avatar className="h-10 w-10">
            <AvatarImage src={peer?.avatarUrl || undefined} alt={title} />
            <AvatarFallback>{title.charAt(0) || "友"}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[16px] font-semibold text-[#264268]">{title}</h1>
            <p className="mt-0.5 truncate text-[11px] text-[#6d85a6]">
              {peer?.username ? `@${peer.username}` : "简单聊天"}
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 pb-4">
        <div className="flex h-full flex-col rounded-[24px] border border-white/75 bg-white/82 shadow-[0_14px_30px_rgba(61,92,140,0.08)]">
          {loading ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <Loader2 className="mb-4 h-8 w-8 animate-spin text-[#315a91]" />
              <p className="text-sm text-[#6d85a6]">正在加载聊天记录</p>
            </div>
          ) : error ? (
            <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-[#6d85a6]">
              {error}
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 px-4 py-4" ref={scrollAreaRef}>
                <div className="space-y-3">
                  {messages.length > 0 ? (
                    messages.map((message) => {
                      const isMine = message.senderId === user.id
                      return (
                        <div key={message.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                          <div
                            className={cn(
                              "max-w-[78%] rounded-[20px] px-4 py-3 text-[13px] leading-6 shadow-sm",
                              isMine ? "bg-[#315a91] text-white" : "bg-[#f4f8fd] text-[#264268]",
                            )}
                          >
                            <div>{message.content}</div>
                            <div className={cn("mt-1 text-[10px]", isMine ? "text-white/72" : "text-[#8aa0bf]")}>
                              {new Date(message.timestamp).toLocaleString("zh-CN", {
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="py-10 text-center text-[13px] text-[#6d85a6]">还没有聊天内容，发第一条消息试试。</div>
                  )}
                </div>
              </ScrollArea>

              <div className="border-t border-[#edf2f8] px-4 py-3">
                <div className="flex items-center gap-2">
                  <Input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                    placeholder="输入消息"
                    className="rounded-full border-[#dbe6f4] bg-white"
                  />
                  <Button className="rounded-full px-4" onClick={handleSend} disabled={sending || !draft.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
