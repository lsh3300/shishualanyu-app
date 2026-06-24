import { NextRequest, NextResponse } from "next/server"

import { createServiceClient } from "@/lib/supabase/server"

type MessageType = "system" | "course" | "order" | "community" | "comment" | "follow"

const FRIEND_CHAT_SUBJECT = "__friend_chat__"

async function resolveUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.replace("Bearer ", "").trim()
    : undefined

  if (!token) return null

  const supabase = createServiceClient()
  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data?.user) {
    console.error("Failed to resolve messages user:", error)
    return null
  }

  return data.user
}

function inferMessageType(subject?: string | null, content?: string | null): MessageType {
  const text = `${subject || ""} ${content || ""}`.toLowerCase()

  if (text.includes("课程")) return "course"
  if (text.includes("订单") || text.includes("发货") || text.includes("物流")) return "order"
  if (text.includes("评论")) return "comment"
  if (text.includes("关注")) return "follow"
  if (text.includes("社区") || text.includes("作品")) return "community"

  return "system"
}

async function isAcceptedFriend(currentUserId: string, peerId: string) {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("friendships")
    .select("id")
    .or(
      `and(requester_id.eq.${currentUserId},addressee_id.eq.${peerId}),and(requester_id.eq.${peerId},addressee_id.eq.${currentUserId})`,
    )
    .eq("status", "accepted")
    .maybeSingle()

  if (error) {
    console.error("Failed to check friendship:", error)
    return false
  }

  return Boolean(data?.id)
}

function toMessageRow(
  item: Record<string, unknown>,
  currentUserId: string,
  profilesMap: Map<string, { full_name?: string | null; username?: string | null; avatar_url?: string | null }>,
) {
  const senderId = typeof item.sender_id === "string" ? item.sender_id : ""
  const profile = senderId ? profilesMap.get(senderId) : undefined
  const isSelfSent = senderId === currentUserId
  const subject = typeof item.subject === "string" ? item.subject : ""
  const content = typeof item.content === "string" ? item.content : ""

  return {
    id: String(item.id),
    type: inferMessageType(subject, content),
    title: subject || "系统消息",
    content,
    isRead: Boolean(item.is_read),
    timestamp: typeof item.created_at === "string" ? item.created_at : new Date().toISOString(),
    avatar: profile?.avatar_url || undefined,
    userName: isSelfSent ? "我" : profile?.full_name || profile?.username || "系统",
    relatedUrl: undefined,
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await resolveUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServiceClient()
    const peerId = request.nextUrl.searchParams.get("peerId")

    if (peerId) {
      const allowed = await isAcceptedFriend(user.id, peerId)
      if (!allowed) {
        return NextResponse.json({ error: "你们还不是好友" }, { status: 403 })
      }

      const { data: peerProfile } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .eq("id", peerId)
        .maybeSingle()

      const { data, error } = await supabase
        .from("messages")
        .select("id, sender_id, receiver_id, content, is_read, created_at")
        .eq("subject", FRIEND_CHAT_SUBJECT)
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${peerId}),and(sender_id.eq.${peerId},receiver_id.eq.${user.id})`)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Failed to load chat messages:", error)
        return NextResponse.json({ error: "Failed to load chat messages" }, { status: 500 })
      }

      const conversation = (Array.isArray(data) ? data : []).map((item) => ({
        id: String(item.id),
        senderId: String(item.sender_id),
        receiverId: String(item.receiver_id),
        content: String(item.content || ""),
        isRead: Boolean(item.is_read),
        timestamp: typeof item.created_at === "string" ? item.created_at : new Date().toISOString(),
      }))

      return NextResponse.json({
        peer: peerProfile
          ? {
              id: String(peerProfile.id),
              fullName: peerProfile.full_name || peerProfile.username || "好友",
              username: peerProfile.username || "",
              avatarUrl: peerProfile.avatar_url || null,
            }
          : null,
        conversation,
      })
    }

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(`receiver_id.eq.${user.id},sender_id.eq.${user.id}`)
      .neq("subject", FRIEND_CHAT_SUBJECT)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Failed to load messages:", error)
      return NextResponse.json({ error: "Failed to load messages" }, { status: 500 })
    }

    const rows = Array.isArray(data) ? data : []
    const senderIds = rows
      .map((item) => (typeof item.sender_id === "string" ? item.sender_id : null))
      .filter((item, index, array): item is string => Boolean(item) && array.indexOf(item) === index)

    const { data: profilesData, error: profilesError } = senderIds.length
      ? await supabase.from("profiles").select("id, username, full_name, avatar_url").in("id", senderIds)
      : { data: [], error: null }

    if (profilesError) {
      console.error("Failed to load message profiles:", profilesError)
    }

    const profilesMap = new Map(
      (Array.isArray(profilesData) ? profilesData : []).map((item) => [
        String(item.id),
        {
          full_name: item.full_name,
          username: item.username,
          avatar_url: item.avatar_url,
        },
      ]),
    )

    const messages = rows.map((item) => toMessageRow(item as Record<string, unknown>, user.id, profilesMap))
    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Messages GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await resolveUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { receiverId, content } = await request.json()
    if (!receiverId || typeof receiverId !== "string") {
      return NextResponse.json({ error: "Missing receiverId" }, { status: 400 })
    }

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json({ error: "消息内容不能为空" }, { status: 400 })
    }

    const allowed = await isAcceptedFriend(user.id, receiverId)
    if (!allowed) {
      return NextResponse.json({ error: "只有好友之间才能聊天" }, { status: 403 })
    }

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        subject: FRIEND_CHAT_SUBJECT,
        content: content.trim(),
      })
      .select("id, sender_id, receiver_id, content, is_read, created_at")
      .maybeSingle()

    if (error || !data) {
      console.error("Failed to send chat message:", error)
      return NextResponse.json({ error: "发送消息失败" }, { status: 500 })
    }

    return NextResponse.json({
      message: {
        id: String(data.id),
        senderId: String(data.sender_id),
        receiverId: String(data.receiver_id),
        content: String(data.content || ""),
        isRead: Boolean(data.is_read),
        timestamp: typeof data.created_at === "string" ? data.created_at : new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Messages POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await resolveUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { messageId, all, peerId } = await request.json()
    const supabase = createServiceClient()

    let query = supabase.from("messages").update({ is_read: true }).eq("receiver_id", user.id)

    if (peerId) {
      query = query.eq("sender_id", peerId).eq("subject", FRIEND_CHAT_SUBJECT)
    } else if (!all) {
      if (!messageId) {
        return NextResponse.json({ error: "Missing messageId" }, { status: 400 })
      }
      query = query.eq("id", messageId)
    }

    const { error } = await query
    if (error) {
      console.error("Failed to update messages:", error)
      return NextResponse.json({ error: "Failed to update messages" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Messages PATCH error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await resolveUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const messageId = request.nextUrl.searchParams.get("id")
    if (!messageId) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", messageId)
      .or(`receiver_id.eq.${user.id},sender_id.eq.${user.id}`)

    if (error) {
      console.error("Failed to delete message:", error)
      return NextResponse.json({ error: "Failed to delete message" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Messages DELETE error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
