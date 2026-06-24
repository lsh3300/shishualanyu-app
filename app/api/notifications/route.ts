import { NextRequest, NextResponse } from "next/server"

import { createServiceClient } from "@/lib/supabase/server"

async function resolveUserId(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.replace("Bearer ", "").trim()
    : undefined

  if (!token) {
    return null
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data?.user) {
    console.error("Failed to resolve notifications user:", error)
    return null
  }

  return data.user.id
}

function normalizeType(type: string | null | undefined) {
  switch (type) {
    case "success":
      return "activity"
    case "warning":
      return "promotion"
    case "error":
      return "alert"
    default:
      return "reminder"
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await resolveUserId(request)

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Failed to load notifications:", error)
      return NextResponse.json({ error: "Failed to load notifications" }, { status: 500 })
    }

    const notifications = (data || []).map((item) => ({
      id: String(item.id),
      type: normalizeType(typeof item.type === "string" ? item.type : undefined),
      title: String(item.title || ""),
      description: String(item.content || ""),
      isRead: Boolean(item.is_read),
      timestamp: item.created_at || new Date().toISOString(),
      actionUrl: undefined,
    }))

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error("Notifications GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await resolveUserId(request)

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { notificationId, all } = await request.json()
    const supabase = createServiceClient()

    let query = supabase.from("notifications").update({ is_read: true }).eq("user_id", userId)

    if (!all) {
      if (!notificationId) {
        return NextResponse.json({ error: "Missing notificationId" }, { status: 400 })
      }
      query = query.eq("id", notificationId)
    }

    const { error } = await query

    if (error) {
      console.error("Failed to update notifications:", error)
      return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Notifications PATCH error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await resolveUserId(request)

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const notificationId = request.nextUrl.searchParams.get("id")
    if (!notificationId) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", userId)
      .eq("id", notificationId)

    if (error) {
      console.error("Failed to delete notification:", error)
      return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Notifications DELETE error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
