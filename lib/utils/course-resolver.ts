import { createServiceClient } from '@/lib/supabaseClient'
import { isUuid } from '@/lib/course-id'

/**
 * 解析课程标识符（可能是 id 或 slug）为真实的课程数据
 * @param identifier 课程 ID 或 slug
 * @returns 课程数据或 null
 */
export async function resolveCourse(identifier: string) {
  const supabase = createServiceClient()

  let course: (Record<string, unknown> & { id?: string }) | null = null

  // 先尝试按 id 查询（仅当 identifier 为 UUID 时，避免 22P02）
  if (isUuid(identifier)) {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', identifier)
      .maybeSingle()

    if (!error && data) {
      course = data as Record<string, unknown>
    }
  }

  // 如果按 id 未命中，尝试按 slug 查询（不用 single，避免 slug 非唯一时报错）
  if (!course) {
    const { data: slugRows, error: slugError } = await supabase
      .from('courses')
      .select('*')
      .eq('slug', identifier)
      .limit(1)

    if (!slugError && Array.isArray(slugRows) && slugRows.length > 0) {
      course = slugRows[0] as Record<string, unknown>
    }
  }

  return course
}

/**
 * 解析课程标识符为真实的课程 ID
 * @param identifier 课程 ID 或 slug
 * @returns 课程的真实 ID 或 null
 */
export async function resolveCourseId(identifier: string): Promise<string | null> {
  const course = await resolveCourse(identifier)
  return course?.id || null
}
