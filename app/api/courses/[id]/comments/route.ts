import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabaseClient"
import { resolveCourse } from "@/lib/utils/course-resolver"
import { getCourseIdCandidates } from "@/lib/utils/course-comments"

async function authenticateUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const token = authHeader?.startsWith("Bearer ") ? authHeader.replace("Bearer ", "").trim() : null

  if (!token) {
    return { user: null, error: "Missing authorization token" }
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data?.user) {
    return { user: null, error: "Invalid token" }
  }

  return { user: data.user, error: null }
}

async function getProfileDisplay(serviceSupabase: ReturnType<typeof createServiceClient>, userId: string) {
  const { data: profileById } = await serviceSupabase
    .from("profiles")
    .select("username, full_name, avatar_url")
    .eq("id", userId)
    .maybeSingle()

  if (profileById) {
    return {
      user_name: profileById.full_name || profileById.username || "用户",
      avatar_url: profileById.avatar_url || null,
    }
  }

  const fallbackResult = await serviceSupabase
    .from("profiles")
    .select("user_id, username, full_name, avatar_url")
    .eq("user_id", userId)
    .maybeSingle()

  return {
    user_name: fallbackResult.data?.full_name || fallbackResult.data?.username || "用户",
    avatar_url: fallbackResult.data?.avatar_url || null,
  }
}

async function detectCourseIdStorage(
  serviceSupabase: ReturnType<typeof createServiceClient>,
  candidates: string[]
) {
  const { data, error } = await serviceSupabase
    .from("course_comments")
    .select("course_id")
    .in("course_id", candidates)
    .limit(1)

  if (!error && data && data.length > 0 && typeof data[0].course_id === "string") {
    return data[0].course_id
  }

  return candidates[0] || null
}

function mapCommentRow(
  comment: Record<string, unknown>,
  profile: { user_name: string; avatar_url: string | null }
) {
  return {
    id: comment.id,
    user_id: comment.user_id,
    user_name: (comment.user_name as string) || profile.user_name || "用户",
    avatar_url: (comment.avatar_url as string | null) ?? profile.avatar_url ?? null,
    content: comment.content,
    likes_count: (comment.likes_count as number) || 0,
    created_at: comment.created_at,
    updated_at: comment.updated_at,
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "20", 10)
    const offset = parseInt(searchParams.get("offset") || "0", 10)

    const course = await resolveCourse(id)
    if (!course) {
      return NextResponse.json({ error: "课程不存在" }, { status: 404 })
    }

    const serviceSupabase = createServiceClient()
    const courseIdCandidates = getCourseIdCandidates(id, course)

    const { data: comments, error, count } = await serviceSupabase
      .from("course_comments")
      .select("*", { count: "exact" })
      .in("course_id", courseIdCandidates)
      .is("parent_id", null)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error("获取评论失败:", error)
      if (error.code === "42P01" || error.code === "22P02") {
        return NextResponse.json({
          comments: [],
          total: 0,
          limit,
          offset,
        })
      }

      throw error
    }

    const userIds = [...new Set((comments || []).map((comment) => String(comment.user_id || "")).filter(Boolean))]
    const profileMap = new Map<string, { user_name: string; avatar_url: string | null }>()

    await Promise.all(
      userIds.map(async (userId) => {
        profileMap.set(userId, await getProfileDisplay(serviceSupabase, userId))
      })
    )

    return NextResponse.json({
      comments:
        comments?.map((comment) =>
          mapCommentRow(comment as Record<string, unknown>, profileMap.get(String(comment.user_id)) || {
            user_name: "用户",
            avatar_url: null,
          })
        ) || [],
      total: count || 0,
      limit,
      offset,
    })
  } catch (error) {
    console.error("获取评论失败:", error)
    return NextResponse.json({ error: "获取失败" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { user, error: authError } = await authenticateUser(request)

    if (authError || !user) {
      return NextResponse.json({ error: "未登录或登录已过期" }, { status: 401 })
    }

    const { content, parent_id } = await request.json()

    const course = await resolveCourse(id)
    if (!course) {
      return NextResponse.json({ error: "课程不存在" }, { status: 404 })
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "评论内容不能为空" }, { status: 400 })
    }

    if (content.length > 500) {
      return NextResponse.json({ error: "评论内容不能超过500字" }, { status: 400 })
    }

    const serviceSupabase = createServiceClient()
    const profile = await getProfileDisplay(serviceSupabase, user.id)
    const courseIdCandidates = getCourseIdCandidates(id, course)
    const preferredCourseId = await detectCourseIdStorage(serviceSupabase, courseIdCandidates)

    const insertPayload: Record<string, unknown> = {
      user_id: user.id,
      course_id: preferredCourseId,
      content: content.trim(),
      parent_id: parent_id || null,
    }

    const { data: comment, error: insertError } = await serviceSupabase
      .from("course_comments")
      .insert(insertPayload)
      .select("*")
      .single()

    if (insertError) {
      console.error("插入评论失败:", insertError)

      if (insertError.code === "22P02") {
        return NextResponse.json(
          { error: "课程评论表的 course_id 类型与当前课程数据不兼容，请执行课程评论相关迁移。", details: insertError.message },
          { status: 400 }
        )
      }

      if (insertError.code === "42703") {
        return NextResponse.json(
          { error: "course_comments 表字段与当前接口不一致，需要补齐或兼容字段。", details: insertError.message },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { error: "发表评论失败", details: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: "评论成功",
        comment: mapCommentRow(comment as Record<string, unknown>, profile),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("发表评论失败:", error)
    return NextResponse.json(
      { error: "发表失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}
