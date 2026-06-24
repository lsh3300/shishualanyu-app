import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'
import { resolveCourse } from '@/lib/utils/course-resolver'

async function authenticateUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.replace('Bearer ', '').trim()
    : null

  if (!token) {
    return { user: null, error: 'Missing authorization token' }
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data?.user) {
    return { user: null, error: 'Invalid token' }
  }

  return { user: data.user, error: null }
}

function isValidUUID(str: string | null | undefined): boolean {
  if (!str) return false
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

function isMissingTableError(error: { code?: string } | null | undefined) {
  return error?.code === '42P01'
}

async function resolveCourseId(rawId: string) {
  const course = await resolveCourse(rawId)
  if (!course) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: '课程不存在' }, { status: 404 }),
    }
  }

  const courseId = typeof course.id === 'string' ? course.id : String(course.id)
  if (!courseId || !isValidUUID(courseId)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          error: '该课程暂不支持点赞功能',
          supported: false,
        },
        { status: 400 }
      ),
    }
  }

  return { ok: true as const, courseId }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { user, error: authError } = await authenticateUser(request)

    if (authError || !user) {
      return NextResponse.json({ error: '未登录或登录已过期' }, { status: 401 })
    }

    const courseResult = await resolveCourseId(id)
    if (!courseResult.ok) {
      return courseResult.response
    }
    const { courseId } = courseResult

    const supabase = createServiceClient()
    const { data: existing, error: existingError } = await supabase
      .from('course_likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .maybeSingle()

    if (isMissingTableError(existingError)) {
      return NextResponse.json(
        {
          error: '点赞功能尚未完成初始化',
          supported: false,
        },
        { status: 503 }
      )
    }

    if (existingError) {
      throw existingError
    }

    if (existing) {
      const { error: deleteError } = await supabase
        .from('course_likes')
        .delete()
        .eq('id', existing.id)

      if (deleteError) {
        throw deleteError
      }

      const { count, error: countError } = await supabase
        .from('course_likes')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', courseId)

      if (countError) {
        throw countError
      }

      return NextResponse.json({
        message: '已取消点赞',
        isLiked: false,
        likesCount: count || 0,
        supported: true,
      })
    }

    const { error: insertError } = await supabase.from('course_likes').insert({
      user_id: user.id,
      course_id: courseId,
    })

    if (isMissingTableError(insertError)) {
      return NextResponse.json(
        {
          error: '点赞功能尚未完成初始化',
          supported: false,
        },
        { status: 503 }
      )
    }

    if (insertError) {
      throw insertError
    }

    const { count, error: countError } = await supabase
      .from('course_likes')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId)

    if (countError) {
      throw countError
    }

    return NextResponse.json({
      message: '点赞成功',
      isLiked: true,
      likesCount: count || 0,
      supported: true,
    })
  } catch (error) {
    console.error('Course like POST error:', error)
    return NextResponse.json({ error: '操作失败' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const courseResult = await resolveCourseId(id)

    if (!courseResult.ok) {
      if (courseResult.response.status === 400) {
        return NextResponse.json({
          isLiked: false,
          likesCount: 0,
          supported: false,
          notice: '该课程暂不支持点赞功能',
        })
      }
      return courseResult.response
    }
    const { courseId } = courseResult

    const supabase = createServiceClient()
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.replace('Bearer ', '').trim()
      : null

    let userId: string | null = null
    if (token) {
      const { data } = await supabase.auth.getUser(token)
      userId = data?.user?.id ?? null
    }

    const { count, error: countError } = await supabase
      .from('course_likes')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId)

    if (isMissingTableError(countError)) {
      return NextResponse.json({
        isLiked: false,
        likesCount: 0,
        supported: false,
        notice: '点赞功能尚未完成初始化',
      })
    }

    if (countError) {
      throw countError
    }

    let isLiked = false
    if (userId) {
      const { data, error: likeStateError } = await supabase
        .from('course_likes')
        .select('id')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .maybeSingle()

      if (isMissingTableError(likeStateError)) {
        return NextResponse.json({
          isLiked: false,
          likesCount: 0,
          supported: false,
          notice: '点赞功能尚未完成初始化',
        })
      }

      if (likeStateError) {
        throw likeStateError
      }

      isLiked = !!data
    }

    return NextResponse.json({
      isLiked,
      likesCount: count || 0,
      supported: true,
    })
  } catch (error) {
    console.error('Course like GET error:', error)
    return NextResponse.json({
      isLiked: false,
      likesCount: 0,
      supported: false,
    })
  }
}
