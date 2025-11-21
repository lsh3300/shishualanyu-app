import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function createRouteClient(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  )
}

async function getUserAndClient(request: NextRequest) {
  const authHeader = request.headers.get("Authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: NextResponse.json({ error: "未授权访问" }, { status: 401 }) }
  }

  const token = authHeader.substring(7)
  const supabase = createRouteClient(token)
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    return { error: NextResponse.json({ error: "未授权访问" }, { status: 401 }) }
  }

  return { supabase, userId: data.user.id }
}

export async function GET(request: NextRequest) {
  try {
    const result = await getUserAndClient(request)
    if ("error" in result) return result.error

    const { supabase, userId } = result
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url, website")
      .eq("id", userId)
      .maybeSingle()

    if (error) {
      console.error("获取用户资料失败:", error)
      return NextResponse.json({ error: "获取用户资料失败" }, { status: 500 })
    }

    return NextResponse.json(
      data ?? {
        id: userId,
        username: null,
        full_name: null,
        avatar_url: null,
        website: null,
      }
    )
  } catch (err) {
    console.error("用户资料 API 错误:", err)
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const result = await getUserAndClient(request)
    if ("error" in result) return result.error

    const { supabase, userId } = result
    const body = (await request.json().catch(() => ({}))) as Partial<{
      full_name: string | null
      username: string | null
      avatar_url: string | null
      website: string | null
    }>

    const updates: any = {
      id: userId,
    }

    if (typeof body.full_name === "string" || body.full_name === null) {
      updates.full_name = body.full_name
    }
    if (typeof body.username === "string" || body.username === null) {
      updates.username = body.username
    }
    if (typeof body.avatar_url === "string" || body.avatar_url === null) {
      updates.avatar_url = body.avatar_url
    }
    if (typeof body.website === "string" || body.website === null) {
      updates.website = body.website
    }

    const { data, error } = await supabase
      .from("profiles")
      .upsert(updates, { onConflict: "id" })
      .select("id, username, full_name, avatar_url, website")
      .single()

    if (error) {
      console.error("更新用户资料失败:", error)
      return NextResponse.json({ error: "更新用户资料失败" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error("更新用户资料时服务器错误:", err)
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 })
  }
}
