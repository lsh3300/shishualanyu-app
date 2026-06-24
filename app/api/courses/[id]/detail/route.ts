import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'
import { resolveCourse } from '@/lib/utils/course-resolver'

function isValidUUID(str: string | null | undefined): boolean {
  if (!str) return false
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const supabase = createServiceClient()
    const course = await resolveCourse(id)

    if (!course) {
      return NextResponse.json({ error: '课程不存在' }, { status: 404 })
    }

    const courseId = course.id as string
    const courseCategory = (course.category as string | null) || null

    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.replace('Bearer ', '').trim()
      : null

    let userId: string | null = null
    if (token) {
      const { data } = await supabase.auth.getUser(token)
      if (data?.user) {
        userId = data.user.id
      }
    }

    const isUuidValid = isValidUUID(courseId)

    const [likesResult, commentsResult, relatedResult] = await Promise.all([
      isUuidValid
        ? (async () => {
            const { count } = await supabase
              .from('course_likes')
              .select('*', { count: 'exact', head: true })
              .eq('course_id', courseId)

            let isLiked = false
            if (userId) {
              const { data } = await supabase
                .from('course_likes')
                .select('id')
                .eq('user_id', userId)
                .eq('course_id', courseId)
                .maybeSingle()
              isLiked = !!data
            }

            return { likesCount: count || 0, isLiked }
          })()
        : Promise.resolve({ likesCount: 0, isLiked: false }),

      isUuidValid
        ? (async () => {
            const { data: comments, error } = await supabase
              .from('course_comments')
              .select('*')
              .eq('course_id', courseId)
              .is('parent_id', null)
              .order('created_at', { ascending: false })
              .limit(20)

            if (error && (error.code === '42P01' || error.code === '22P02')) {
              return { comments: [] }
            }

            return {
              comments: (comments || []).map((c: Record<string, unknown>) => ({
                id: c.id,
                user_id: c.user_id,
                user_name: (c.user_name as string) || '用户',
                avatar_url: c.avatar_url || null,
                content: c.content,
                likes_count: (c.likes_count as number) || 0,
                created_at: c.created_at,
              })),
            }
          })()
        : Promise.resolve({ comments: [] }),

      (async () => {
        let query = supabase
          .from('courses')
          .select('id, slug, title, category, image_url, duration')
          .limit(6)

        if (courseCategory) {
          query = query.eq('category', courseCategory)
        }

        const { data: related } = await query
        const filtered = (related || []).filter(
          (c: Record<string, unknown>) => c.id !== courseId && c.slug !== id,
        )
        return { relatedCourses: filtered.slice(0, 6) }
      })(),
    ])

    // 只有非用户特定的数据可缓存（课程信息 + 推荐课程）
    // likes/comments 部分因含用户状态不缓存
    const response = NextResponse.json({
      course,
      likes: likesResult,
      comments: commentsResult.comments,
      relatedCourses: relatedResult.relatedCourses,
    })

    // 告诉 Vercel Edge 和浏览器缓存 60 秒，期间相同请求直接从边缘返回
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=60, stale-while-revalidate=300',
    )

    return response
  } catch (error) {
    console.error('获取课程详情失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
