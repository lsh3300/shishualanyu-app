import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'
import { isUuid, normalizeCourseId } from '@/lib/course-id'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    console.log('📚 课程详情 API 被调用, id:', id)
    
    if (!id) {
      console.log('❌ 缺少课程ID')
      return NextResponse.json({ error: '缺少课程ID' }, { status: 400 })
    }
    
    const supabase = createServiceClient()

    const normalizedId = normalizeCourseId(id)
    const idCandidates = [id, normalizedId]
      .filter((v): v is string => Boolean(v))
      .filter((v) => isUuid(v))

    // 1) 尝试按 id（UUID / legacy UUID）查询（仅当输入为 UUID 时）
    console.log('🔍 尝试按 id 查询:', idCandidates.length ? idCandidates : '(skip: non-uuid)')
    let course: any = null
    let idQueryError: any = null

    for (const candidate of idCandidates) {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('id', candidate)
          .maybeSingle()

        if (error) {
          idQueryError = error
          console.log('📊 按 id 查询错误:', { candidate, error: error.message })
          continue
        }

        if (data) {
          course = data
          break
        }
      } catch (e) {
        console.log('📊 按 id 查询异常:', { candidate, error: e instanceof Error ? e.message : String(e) })
      }
    }

    // 2) 如果按 id 未命中（或跳过），尝试按 slug 查询（不用 single，避免 slug 非唯一时报错）
    if (!course) {
      console.log('🔍 按 id 未命中，尝试按 slug 查询:', id)
      const { data: slugRows, error: slugError } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', id)
        .limit(1)

      console.log('📊 按 slug 查询结果:', {
        found: Array.isArray(slugRows) && slugRows.length > 0,
        rows: Array.isArray(slugRows) ? slugRows.length : 0,
        error: slugError?.message,
      })

      if (!slugError && Array.isArray(slugRows) && slugRows.length > 0) {
        course = slugRows[0]
      }
    }

    if (!course) {
      console.error('❌ 获取课程失败:', { id, idQueryError: idQueryError?.message })
      return NextResponse.json({ error: '课程不存在' }, { status: 404 })
    }
    
    console.log('✅ 找到课程:', course.title)
    return NextResponse.json({ course })
  } catch (error) {
    console.error('❌ GET /api/courses/[id] 错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
