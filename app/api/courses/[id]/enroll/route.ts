import { NextRequest, NextResponse } from "next/server";

import { createServiceClient } from "@/lib/supabaseClient";
import { resolveCourse } from "@/lib/utils/course-resolver";

async function authenticateUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.replace("Bearer ", "").trim()
    : null;

  if (!token) {
    return { user: null, error: "Missing authorization token" };
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    return { user: null, error: "Invalid token" };
  }

  return { user: data.user, error: null };
}

async function resolveCourseId(id: string) {
  const course = await resolveCourse(id);
  if (!course) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "课程不存在" }, { status: 404 }),
    };
  }

  const courseId = typeof course.id === "string" ? course.id : String(course.id);
  if (!courseId) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "课程数据无效" }, { status: 500 }),
    };
  }

  return {
    ok: true as const,
    courseId,
  };
}

async function findEnrollment(userId: string, courseId: string) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("enrollments")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const { user, error: authError } = await authenticateUser(request);

    if (authError || !user) {
      return NextResponse.json({ error: "未登录或登录已过期" }, { status: 401 });
    }

    const courseResult = await resolveCourseId(id);
    if (!courseResult.ok) {
      return courseResult.response;
    }
    const { courseId } = courseResult;

    const supabase = createServiceClient();
    const existing = await findEnrollment(user.id, courseId);

    if (existing) {
      const nextStatus = existing.completed_at ? existing.status : "in_progress";
      const { data, error } = await supabase
        .from("enrollments")
        .update({
          last_accessed_at: new Date().toISOString(),
          status: nextStatus,
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return NextResponse.json({
        message: "继续学习",
        enrollment: data,
      });
    }

    const { data: enrollment, error: enrollError } = await supabase
      .from("enrollments")
      .insert({
        user_id: user.id,
        course_id: courseId,
        status: "in_progress",
        progress: 0,
        last_accessed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (enrollError) {
      throw enrollError;
    }

    return NextResponse.json(
      {
        message: "开始学习",
        enrollment,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Course enroll POST error:", error);
    return NextResponse.json({ error: "报名失败" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const { user, error: authError } = await authenticateUser(request);

    if (authError || !user) {
      return NextResponse.json({ error: "未登录或登录已过期" }, { status: 401 });
    }

    const { progress } = await request.json();
    if (typeof progress !== "number" || progress < 0 || progress > 100) {
      return NextResponse.json({ error: "进度值无效" }, { status: 400 });
    }

    const courseResult = await resolveCourseId(id);
    if (!courseResult.ok) {
      return courseResult.response;
    }
    const { courseId } = courseResult;

    const supabase = createServiceClient();
    let enrollment = await findEnrollment(user.id, courseId);

    if (!enrollment) {
      const { data: createdEnrollment, error: createError } = await supabase
        .from("enrollments")
        .insert({
          user_id: user.id,
          course_id: courseId,
          status: progress >= 100 ? "completed" : "in_progress",
          progress: 0,
          last_accessed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      enrollment = createdEnrollment;
    }

    const updateData: Record<string, unknown> = {
      progress: Math.round(progress),
      last_accessed_at: new Date().toISOString(),
      status: progress >= 100 ? "completed" : "in_progress",
    };

    if (progress >= 100) {
      updateData.completed_at = enrollment.completed_at || new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("enrollments")
      .update(updateData)
      .eq("id", enrollment.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      message: progress >= 100 ? "恭喜完成课程！" : "进度已更新",
      enrollment: data,
    });
  } catch (error) {
    console.error("Course enroll PATCH error:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}
