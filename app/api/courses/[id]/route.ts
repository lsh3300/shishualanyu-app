import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'

function isUuid(value: string) {
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(value)
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceClient()
    const { id } = params

    let courseQuery = supabase
      .from('courses')
      .select('*')
      .eq('status', 'published')

    // 支持通过 UUID 或 slug 查询
    if (isUuid(id)) {
      courseQuery = courseQuery.eq('id', id)
    } else {
      courseQuery = courseQuery.eq('slug', id)
    }

    const { data: course, error: courseError } = await courseQuery.single()

    if (courseError || !course) {
      return NextResponse.json({ error: '课程不存在' }, { status: 404 })
    }

    // 获取课程章节
    const { data: chapters, error: chaptersError } = await supabase
      .from('course_chapters')
      .select('*')
      .eq('course_id', course.id)
      .order('position', { ascending: true })

    if (chaptersError) {
      console.error('获取课程章节失败:', chaptersError)
    }

    return NextResponse.json({
      ...course,
      chapters: chapters || []
    })
  } catch (error) {
    console.error('GET /api/courses/[id] 错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
