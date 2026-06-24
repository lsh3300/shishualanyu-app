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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { id, commentId } = await params
    const { user, error: authError } = await authenticateUser(request)

    if (authError || !user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const course = await resolveCourse(id)
    if (!course) {
      return NextResponse.json({ error: "课程不存在" }, { status: 404 })
    }

    const serviceSupabase = createServiceClient()
    const courseIdCandidates = getCourseIdCandidates(id, course)

    const { data: comment, error: fetchError } = await serviceSupabase
      .from("course_comments")
      .select("*")
      .eq("id", commentId)
      .in("course_id", courseIdCandidates)
      .maybeSingle()

    if (fetchError) {
      if (fetchError.code === "42P01") {
        return NextResponse.json({ message: "评论已删除" })
      }

      console.error("删除评论前查询失败:", fetchError)
      return NextResponse.json(
        { error: "评论查询失败", details: fetchError.message },
        { status: 500 }
      )
    }

    if (!comment) {
      return NextResponse.json({ error: "评论不存在" }, { status: 404 })
    }

    if (comment.user_id !== user.id) {
      return NextResponse.json({ error: "无权删除此评论" }, { status: 403 })
    }

    const { data: deletedRows, error: deleteError } = await serviceSupabase
      .from("course_comments")
      .delete()
      .eq("id", commentId)
      .select("id")

    if (deleteError) {
      console.error("删除评论失败:", deleteError)
      return NextResponse.json(
        { error: "删除失败", details: deleteError.message },
        { status: 500 }
      )
    }

    if (!deletedRows || deletedRows.length === 0) {
      return NextResponse.json({ error: "评论不存在" }, { status: 404 })
    }

    return NextResponse.json({ message: "评论已删除" })
  } catch (error) {
    console.error("删除评论失败:", error)
    return NextResponse.json(
      { error: "删除失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}
