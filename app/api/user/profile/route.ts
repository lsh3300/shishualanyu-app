import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabaseClient"

// 优化：快速解析 JWT 获取用户 ID，避免每次都调用 getUser
function parseJwtUserId(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    // 检查是否过期
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }
    return payload.sub || null;
  } catch {
    return null;
  }
}

async function getUserId(request: NextRequest, supabase: ReturnType<typeof createServiceClient>) {
  const authHeader = request.headers.get("Authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.substring(7)
  
  // 优化：先尝试快速解析 JWT
  const quickUserId = parseJwtUserId(token)
  if (quickUserId) {
    return quickUserId
  }
  
  // 回退到完整验证
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) {
    return null
  }

  return data.user.id
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const userId = await getUserId(request, supabase)
    
    if (!userId) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }

    // 先尝试使用 id 列查询
    const { data: dataById, error: errorById } = await supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url, website, updated_at")
      .eq("id", userId)
      .maybeSingle()

    let data = dataById

    // 如果失败或没有数据，尝试使用 user_id 列
    if (errorById || !data) {
      const result = await supabase
        .from("profiles")
        .select("user_id, username, full_name, avatar_url, website, updated_at")
        .eq("user_id", userId)
        .maybeSingle()
      
      if (!result.error && result.data) {
        data = { ...result.data, id: result.data.user_id }
      }
    }

    return NextResponse.json(
      data ?? {
        id: userId,
        username: null,
        full_name: null,
        avatar_url: null,
        website: null,
        updated_at: null,
      }
    )
  } catch (err) {
    console.error("用户资料 API 错误:", err)
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const userId = await getUserId(request, supabase)
    
    if (!userId) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }

    const body = (await request.json().catch(() => ({}))) as Partial<{
      full_name: string | null
      username: string | null
      avatar_url: string | null
      website: string | null
    }>

    const updateFields: any = {
      updated_at: new Date().toISOString(),
    }

    if (typeof body.full_name === "string" || body.full_name === null) {
      updateFields.full_name = body.full_name
    }
    if (typeof body.username === "string" || body.username === null) {
      updateFields.username = body.username
    }
    if (typeof body.avatar_url === "string" || body.avatar_url === null) {
      updateFields.avatar_url = body.avatar_url
    }
    if (typeof body.website === "string" || body.website === null) {
      updateFields.website = body.website
    }

    // 先尝试使用 id 列更新
    const { data: dataById, error: errorById } = await supabase
      .from("profiles")
      .update(updateFields)
      .eq("id", userId)
      .select("id, username, full_name, avatar_url, website, updated_at")
      .maybeSingle()

    let data = dataById

    // 如果失败或没有更新到数据，尝试使用 user_id 列
    if (errorById || !data) {
      const result = await supabase
        .from("profiles")
        .update(updateFields)
        .eq("user_id", userId)
        .select("user_id, username, full_name, avatar_url, website, updated_at")
        .maybeSingle()
      
      if (result.error) {
        console.error("更新用户资料失败:", result.error)
        return NextResponse.json({ error: "更新用户资料失败" }, { status: 500 })
      }
      
      if (result.data) {
        data = { ...result.data, id: result.data.user_id }
      }
    }

    return NextResponse.json(data ?? { id: userId, ...updateFields })
  } catch (err) {
    console.error("更新用户资料时服务器错误:", err)
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 })
  }
}
