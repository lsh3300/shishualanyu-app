import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'

// 验证用户身份
async function authenticateUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '').trim() : null
  
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

// DELETE - 删除评论
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    console.log('🗑️ 删除评论请求:', params)
    
    // 验证用户
    const { user, error: authError } = await authenticateUser(request)
    if (authError || !user) {
      console.log('❌ 用户认证失败:', authError)
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }
    
    const courseId = params.id
    const commentId = params.commentId
    const serviceSupabase = createServiceClient()
    
    // 先检查评论是否存在且属于当前用户
    const { data: comment, error: fetchError } = await serviceSupabase
      .from('course_comments')
      .select('*')
      .eq('id', commentId)
      .eq('course_id', courseId)
      .single()
    
    if (fetchError || !comment) {
      console.log('❌ 评论不存在:', fetchError)
      return NextResponse.json({ error: '评论不存在' }, { status: 404 })
    }
    
    // 检查是否是评论作者
    if (comment.user_id !== user.id) {
      console.log('❌ 无权删除他人评论')
      return NextResponse.json({ error: '无权删除此评论' }, { status: 403 })
    }
    
    // 删除评论
    const { error: deleteError } = await serviceSupabase
      .from('course_comments')
      .delete()
      .eq('id', commentId)
    
    if (deleteError) {
      console.error('❌ 删除评论失败:', deleteError)
      throw deleteError
    }
    
    console.log('✅ 评论删除成功')
    return NextResponse.json({
      message: '评论已删除'
    })
    
  } catch (error) {
    console.error('❌ 删除评论异常:', error)
    return NextResponse.json(
      { error: '删除失败' },
      { status: 500 }
    )
  }
}
