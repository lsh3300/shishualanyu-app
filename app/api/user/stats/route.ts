import { NextRequest, NextResponse } from "next/server";

import { createServiceClient } from "@/lib/supabase/server";

async function resolveUserId(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.replace("Bearer ", "").trim()
    : undefined;

  if (!token) {
    return null;
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    console.error("Failed to resolve stats user:", error);
    return null;
  }

  return data.user.id;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await resolveUserId(request);

    if (!userId) {
      return NextResponse.json({
        stats: { orders: 0, courses: 0, favorites: 0, assignments: 0, learningDays: 0, completedCourses: 0 },
      });
    }

    const supabase = createServiceClient();

    const [
      ordersResult,
      favoritesResult,
      articleFavoritesResult,
      enrollmentsResult,
      creationsResult,
    ] = await Promise.all([
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("favorites").select("id", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("article_favorites").select("id", { count: "exact", head: true }).eq("user_id", userId),
      supabase
        .from("enrollments")
        .select("status, progress, completed_at, started_at, last_accessed_at")
        .eq("user_id", userId),
      supabase.from("cloths").select("id", { count: "exact", head: true }).eq("creator_id", userId),
    ]);

    const enrollments = Array.isArray(enrollmentsResult.data) ? enrollmentsResult.data : [];
    const completedCourses = enrollments.filter((item) => {
      const row = item as Record<string, unknown>;
      return row.completed_at !== null || row.status === "completed" || row.progress === 100;
    }).length;

    const learningDates = new Set<string>();
    enrollments.forEach((item) => {
      const row = item as Record<string, unknown>;
      const startedAt = typeof row.started_at === "string" ? row.started_at : null;
      const lastAccessedAt = typeof row.last_accessed_at === "string" ? row.last_accessed_at : null;

      if (startedAt) learningDates.add(startedAt.split("T")[0]);
      if (lastAccessedAt) learningDates.add(lastAccessedAt.split("T")[0]);
    });

    return NextResponse.json({
      stats: {
        orders: ordersResult.count || 0,
        courses: enrollments.length,
        favorites: (favoritesResult.count || 0) + (articleFavoritesResult.count || 0),
        assignments: creationsResult.count || 0,
        learningDays: learningDates.size,
        completedCourses,
      },
    });
  } catch (error) {
    console.error("User stats API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
