import { NextRequest, NextResponse } from "next/server"

import { createServiceClient } from "@/lib/supabase/server"

function isUuidLike(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

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
    console.error("Failed to resolve courses user:", error)
    return null
  }

  return data.user.id
}

export async function GET(request: NextRequest) {
  try {
    const userId = await resolveUserId(request)

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServiceClient()
    const { data: enrollmentsData, error: enrollmentsError } = await supabase
      .from("enrollments")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })

    if (enrollmentsError) {
      console.error("Failed to load courses:", enrollmentsError)
      return NextResponse.json({ error: "Failed to load courses" }, { status: 500 })
    }

    const enrollments = Array.isArray(enrollmentsData) ? enrollmentsData : []
    const courseIds = Array.from(
      new Set(
        enrollments
          .map((item) => {
            const courseId = (item as Record<string, unknown>).course_id
            return typeof courseId === "string" && isUuidLike(courseId) ? courseId : null
          })
          .filter((item): item is string => item !== null),
      ),
    )

    const { data: coursesData, error: coursesError } = courseIds.length
      ? await supabase
          .from("courses")
          .select("*")
          .in("id", courseIds)
      : { data: [], error: null }

    if (coursesError) {
      console.error("Failed to load course records:", coursesError)
      return NextResponse.json({ error: "Failed to load courses" }, { status: 500 })
    }

    const coursesMap = new Map(
      (Array.isArray(coursesData) ? coursesData : []).map((item) => [String(item.id), item]),
    )

    const hydratedEnrollments = enrollments.map((item): Record<string, unknown> & { courses: unknown } => {
      const row = item as Record<string, unknown>
      const courseId = typeof row.course_id === "string" ? row.course_id : ""
      return {
        ...row,
        courses: coursesMap.get(courseId) || null,
      }
    })

    const completed = hydratedEnrollments.filter((item) => {
      const row = item as Record<string, unknown>
      return row.completed_at !== null || row.status === "completed" || row.progress === 100
    }).length
    const inProgress = Math.max(0, hydratedEnrollments.length - completed)

    let learningDays = 0
    if (hydratedEnrollments.length > 0) {
      const firstEnrollment = hydratedEnrollments.reduce((earliest, current) =>
        new Date(String((current as Record<string, unknown>).created_at)) <
        new Date(String((earliest as Record<string, unknown>).created_at))
          ? current
          : earliest,
      )
      const diffTime = Math.abs(
        Date.now() - new Date(String((firstEnrollment as Record<string, unknown>).created_at)).getTime(),
      )
      learningDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    return NextResponse.json({
      courses: {
        total: hydratedEnrollments.length,
        completed,
        inProgress,
        list: hydratedEnrollments,
      },
      learningDays,
    })
  } catch (error) {
    console.error("Courses API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
