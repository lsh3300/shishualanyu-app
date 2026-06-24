import { NextRequest, NextResponse } from "next/server"

import type { FriendAction } from "@/lib/friends"
import { createServiceClient } from "@/lib/supabase/server"

type FriendshipRow = {
  id: string
  requester_id: string
  addressee_id: string
  status: "pending" | "accepted" | "rejected"
  created_at: string
}

async function resolveUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.replace("Bearer ", "").trim()
    : undefined

  if (!token) return null

  const supabase = createServiceClient()
  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data?.user) {
    console.error("Failed to resolve friends user:", error)
    return null
  }

  return data.user
}

async function loadProfiles(profileIds: string[]) {
  const supabase = createServiceClient()
  const { data, error } = profileIds.length
    ? await supabase.from("profiles").select("id, username, full_name, avatar_url").in("id", profileIds)
    : { data: [], error: null }

  if (error) {
    console.error("Failed to load friend profiles:", error)
  }

  return new Map(
    (Array.isArray(data) ? data : []).map((item) => [
      String(item.id),
      {
        id: String(item.id),
        username: item.username || "",
        full_name: item.full_name || "",
        avatar_url: item.avatar_url || null,
      },
    ]),
  )
}

function toFriendCard(
  row: FriendshipRow,
  currentUserId: string,
  profilesMap: Map<string, { id: string; username: string; full_name: string; avatar_url: string | null }>,
) {
  const peerId = row.requester_id === currentUserId ? row.addressee_id : row.requester_id
  const profile = profilesMap.get(peerId)

  return {
    id: peerId,
    friendshipId: row.id,
    fullName: profile?.full_name || profile?.username || "未命名用户",
    username: profile?.username || "",
    avatarUrl: profile?.avatar_url || null,
    createdAt: row.created_at,
    status: row.status,
  }
}

async function findRelationship(currentUserId: string, targetUserId: string) {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from("friendships")
    .select("id, requester_id, addressee_id, status, created_at")
    .or(
      `and(requester_id.eq.${currentUserId},addressee_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},addressee_id.eq.${currentUserId})`,
    )
    .maybeSingle()

  if (error) {
    console.error("Failed to load friendship relation:", error)
    return null
  }

  return (data as FriendshipRow | null) ?? null
}

export async function GET(request: NextRequest) {
  try {
    const user = await resolveUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const lookup = request.nextUrl.searchParams.get("lookup")?.trim()
    const supabase = createServiceClient()

    if (lookup) {
      if (lookup === user.id) {
        return NextResponse.json({
          candidate: null,
          relation: {
            state: "self",
          },
        })
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .eq("id", lookup)
        .maybeSingle()

      if (error) {
        console.error("Failed to lookup candidate profile:", error)
        return NextResponse.json({ error: "Failed to lookup candidate" }, { status: 500 })
      }

      if (!profile) {
        return NextResponse.json({
          candidate: null,
          relation: { state: "none" },
        })
      }

      const relation = await findRelationship(user.id, lookup)

      let state: "none" | "incoming" | "outgoing" | "accepted" | "rejected" = "none"
      if (relation?.status === "accepted") {
        state = "accepted"
      } else if (relation?.status === "rejected") {
        state = "rejected"
      } else if (relation?.status === "pending") {
        state = relation.requester_id === user.id ? "outgoing" : "incoming"
      }

      return NextResponse.json({
        candidate: {
          id: String(profile.id),
          fullName: profile.full_name || profile.username || "未命名用户",
          username: profile.username || "",
          avatarUrl: profile.avatar_url || null,
        },
        relation: {
          state,
          friendshipId: relation?.id,
          status: relation?.status,
        },
      })
    }

    const { data, error } = await supabase
      .from("friendships")
      .select("id, requester_id, addressee_id, status, created_at")
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .in("status", ["pending", "accepted"])
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Failed to load friendships:", error)
      return NextResponse.json({ error: "Failed to load friendships" }, { status: 500 })
    }

    const rows = (Array.isArray(data) ? data : []) as FriendshipRow[]
    const profileIds = Array.from(
      new Set(
        rows.flatMap((row) => [row.requester_id, row.addressee_id]).filter((id) => id && id !== user.id),
      ),
    )
    const profilesMap = await loadProfiles(profileIds)

    const friends = rows
      .filter((row) => row.status === "accepted")
      .map((row) => toFriendCard(row, user.id, profilesMap))

    const incomingRequests = rows
      .filter((row) => row.status === "pending" && row.addressee_id === user.id)
      .map((row) => toFriendCard(row, user.id, profilesMap))

    const outgoingRequests = rows
      .filter((row) => row.status === "pending" && row.requester_id === user.id)
      .map((row) => toFriendCard(row, user.id, profilesMap))

    return NextResponse.json({
      friends,
      incomingRequests,
      outgoingRequests,
    })
  } catch (error) {
    console.error("Friends GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await resolveUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { targetUserId } = await request.json()

    if (!targetUserId || typeof targetUserId !== "string") {
      return NextResponse.json({ error: "Missing targetUserId" }, { status: 400 })
    }

    if (targetUserId === user.id) {
      return NextResponse.json({ error: "不能添加自己为好友" }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data: targetProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", targetUserId)
      .maybeSingle()

    if (!targetProfile) {
      return NextResponse.json({ error: "目标用户不存在" }, { status: 404 })
    }

    const existing = await findRelationship(user.id, targetUserId)

    if (existing?.status === "accepted") {
      return NextResponse.json({ error: "你们已经是好友了" }, { status: 409 })
    }

    if (existing?.status === "pending") {
      if (existing.requester_id === user.id) {
        return NextResponse.json({ error: "好友申请已发送" }, { status: 409 })
      }

      const { data: accepted, error } = await supabase
        .from("friendships")
        .update({
          status: "accepted",
          acted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select("id")
        .maybeSingle()

      if (error || !accepted) {
        console.error("Failed to auto accept friendship:", error)
        return NextResponse.json({ error: "处理好友申请失败" }, { status: 500 })
      }

      return NextResponse.json({
        message: "已自动通过对方发来的好友申请",
        friendshipId: accepted.id,
      })
    }

    if (existing?.status === "rejected") {
      const { data: resetRow, error } = await supabase
        .from("friendships")
        .update({
          requester_id: user.id,
          addressee_id: targetUserId,
          status: "pending",
          acted_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select("id")
        .maybeSingle()

      if (error || !resetRow) {
        console.error("Failed to reset rejected friendship:", error)
        return NextResponse.json({ error: "重新发起好友申请失败" }, { status: 500 })
      }

      return NextResponse.json({
        message: "好友申请已重新发送",
        friendshipId: resetRow.id,
      })
    }

    const { data: inserted, error } = await supabase
      .from("friendships")
      .insert({
        requester_id: user.id,
        addressee_id: targetUserId,
        status: "pending",
      })
      .select("id")
      .maybeSingle()

    if (error || !inserted) {
      console.error("Failed to create friendship request:", error)
      return NextResponse.json({ error: "发送好友申请失败" }, { status: 500 })
    }

    return NextResponse.json({
      message: "好友申请已发送",
      friendshipId: inserted.id,
    })
  } catch (error) {
    console.error("Friends POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await resolveUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { friendshipId, action } = (await request.json()) as { friendshipId?: string; action?: FriendAction }

    if (!friendshipId || !action) {
      return NextResponse.json({ error: "Missing friendshipId or action" }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from("friendships")
      .select("id, requester_id, addressee_id, status")
      .eq("id", friendshipId)
      .maybeSingle()

    if (error || !data) {
      return NextResponse.json({ error: "好友关系不存在" }, { status: 404 })
    }

    const row = data as { id: string; requester_id: string; addressee_id: string; status: "pending" | "accepted" | "rejected" }
    const isRequester = row.requester_id === user.id
    const isAddressee = row.addressee_id === user.id

    if (!isRequester && !isAddressee) {
      return NextResponse.json({ error: "无权操作该好友关系" }, { status: 403 })
    }

    if (action === "accept") {
      if (!isAddressee || row.status !== "pending") {
        return NextResponse.json({ error: "当前申请无法通过" }, { status: 400 })
      }

      const { error: updateError } = await supabase
        .from("friendships")
        .update({
          status: "accepted",
          acted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", friendshipId)

      if (updateError) {
        console.error("Failed to accept friendship:", updateError)
        return NextResponse.json({ error: "通过好友申请失败" }, { status: 500 })
      }

      return NextResponse.json({ message: "已添加为好友" })
    }

    if (action === "reject") {
      if (!isAddressee || row.status !== "pending") {
        return NextResponse.json({ error: "当前申请无法拒绝" }, { status: 400 })
      }

      const { error: updateError } = await supabase
        .from("friendships")
        .update({
          status: "rejected",
          acted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", friendshipId)

      if (updateError) {
        console.error("Failed to reject friendship:", updateError)
        return NextResponse.json({ error: "拒绝好友申请失败" }, { status: 500 })
      }

      return NextResponse.json({ message: "已拒绝好友申请" })
    }

    if (action === "cancel") {
      if (!isRequester || row.status !== "pending") {
        return NextResponse.json({ error: "当前申请无法撤回" }, { status: 400 })
      }

      const { error: deleteError } = await supabase.from("friendships").delete().eq("id", friendshipId)
      if (deleteError) {
        console.error("Failed to cancel friendship:", deleteError)
        return NextResponse.json({ error: "撤回好友申请失败" }, { status: 500 })
      }

      return NextResponse.json({ message: "好友申请已撤回" })
    }

    if (action === "remove") {
      if (row.status !== "accepted") {
        return NextResponse.json({ error: "当前关系无法删除" }, { status: 400 })
      }

      const { error: deleteError } = await supabase.from("friendships").delete().eq("id", friendshipId)
      if (deleteError) {
        console.error("Failed to remove friendship:", deleteError)
        return NextResponse.json({ error: "删除好友失败" }, { status: 500 })
      }

      return NextResponse.json({ message: "已删除好友" })
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 })
  } catch (error) {
    console.error("Friends PATCH error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
