import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'

export async function POST() {
  try {
    const supabase = createServiceClient()
    
    console.log('开始修复 favorites 表结构...')
    
    // 检查当前表结构
    const { data: currentData, error: checkError } = await supabase
      .from('favorites')
      .select('id, user_id, product_id, created_at')
      .limit(1)
    
    console.log('当前表结构检查:', { hasData: !!currentData, error: checkError?.message })
    
    // 由于我们无法直接修改表结构，我们需要确保 favorites 表支持课程收藏
    // 让我们先检查是否有 course_id 字段
    try {
      const { data: testCourse, error: courseError } = await supabase
        .from('favorites')
        .select('course_id')
        .limit(1)
      
      if (!courseError) {
        console.log('course_id 字段已存在')
        return NextResponse.json({
          success: true,
          message: 'favorites 表结构正常，支持课程收藏',
          hasProductId: true,
          hasCourseId: true
        })
      } else {
        console.log('course_id 字段不存在:', courseError.message)
      }
    } catch (e) {
      console.log('course_id 字段检查失败')
    }
    
    // 如果没有 course_id 字段，我们需要提供 SQL 脚本来修复
    return NextResponse.json({
      success: false,
      message: 'favorites 表需要添加 course_id 字段以支持课程收藏',
      sqlScript: `
-- 添加 course_id 字段到 favorites 表
ALTER TABLE favorites ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id) ON DELETE CASCADE;

-- 修改唯一约束，允许商品收藏或课程收藏
DROP INDEX IF EXISTS favorites_user_id_product_id_key;
CREATE UNIQUE INDEX favorites_user_product_key ON favorites (user_id, product_id) WHERE product_id IS NOT NULL;
CREATE UNIQUE INDEX favorites_user_course_key ON favorites (user_id, course_id) WHERE course_id IS NOT NULL;

-- 添加检查约束，确保 product_id 和 course_id 至少有一个不为空
ALTER TABLE favorites ADD CONSTRAINT favorites_item_check CHECK (
  (product_id IS NOT NULL AND course_id IS NULL) OR 
  (product_id IS NULL AND course_id IS NOT NULL)
);
      `,
      instructions: [
        '1. 登录 Supabase Dashboard',
        '2. 进入 SQL 编辑器',
        '3. 复制并执行上面的 SQL 脚本',
        '4. 执行完成后，收藏功能将支持商品和课程'
      ]
    })
    
  } catch (error) {
    console.error('修复 favorites 表失败:', error)
    return NextResponse.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
