/**
 * 保存到最近创作API
 * POST /api/inventory/save-recent
 * 
 * 在作品评分后自动调用，保存到"最近创作"列表
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies })

    // 验证用户（支持测试模式）
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // 测试模式：如果没有用户，使用固定的测试用户ID（有效UUID格式）
    const userId = user?.id || '00000000-0000-0000-0000-000000000000'
    const isTestMode = !user
    
    if (isTestMode) {
      console.log('🧪 测试模式：使用临时用户ID', userId)
    }

    // 获取请求体
    const body = await request.json()
    const { cloth_id } = body

    if (!cloth_id) {
      return NextResponse.json(
        { error: '缺少cloth_id参数' },
        { status: 400 }
      )
    }

    // 测试模式：直接跳过所有者检查
    if (!isTestMode) {
      // 检查作品是否属于当前用户
      const { data: cloth, error: clothError } = await supabase
        .from('cloths')
        .select('user_id')
        .eq('id', cloth_id)
        .single()

      if (clothError || !cloth) {
        return NextResponse.json(
          { error: '作品不存在' },
          { status: 404 }
        )
      }

      if (cloth.user_id !== user.id) {
        return NextResponse.json(
          { error: '无权限操作此作品' },
          { status: 403 }
        )
      }
    } else {
      console.log('🧪 测试模式：跳过所有者检查')
    }

    // 检查是否已存在于背包或最近创作中
    const { data: existing } = await supabase
      .from('user_inventory')
      .select('id, slot_type')
      .eq('user_id', userId)
      .eq('cloth_id', cloth_id)
      .single()

    if (existing) {
      // 如果已经在背包中，不做任何操作
      if (existing.slot_type === 'inventory') {
        return NextResponse.json({
          success: true,
          message: '作品已在背包中',
          already_saved: true
        })
      }
      
      // 如果已在最近创作中，更新时间
      await supabase
        .from('user_inventory')
        .update({
          added_at: new Date().toISOString()
        })
        .eq('id', existing.id)

      return NextResponse.json({
        success: true,
        message: '已更新到最近创作',
        already_in_recent: true
      })
    }

    // 添加到最近创作
    const { error: insertError } = await supabase
      .from('user_inventory')
      .insert({
        user_id: userId,
        cloth_id,
        slot_type: 'recent',
        added_at: new Date().toISOString()
      })

    if (insertError) throw insertError

    // 更新作品状态
    await supabase
      .from('cloths')
      .update({
        status: 'draft',
        is_recent: true
      })
      .eq('id', cloth_id)

    // 清理超过5个的旧记录
    await cleanupRecentCreations(userId)

    return NextResponse.json({
      success: true,
      message: '已自动保存到最近创作'
    })

  } catch (error) {
    console.error('Error saving to recent creations:', error)
    return NextResponse.json(
      { error: '保存失败' },
      { status: 500 }
    )
  }
}

/**
 * 清理"最近创作"，保留最新5个
 */
async function cleanupRecentCreations(userId: string): Promise<void> {
  const supabase = createServerComponentClient({ cookies })

  try {
    // 获取所有"最近创作"
    const { data: recent } = await supabase
      .from('user_inventory')
      .select('id, cloth_id')
      .eq('user_id', userId)
      .eq('slot_type', 'recent')
      .order('added_at', { ascending: false })

    if (recent && recent.length > 5) {
      // 删除超过5个的旧记录
      const toDelete = recent.slice(5)
      const deleteIds = toDelete.map(item => item.id)
      const clothIds = toDelete.map(item => item.cloth_id)

      // 删除背包记录
      await supabase
        .from('user_inventory')
        .delete()
        .in('id', deleteIds)

      // 更新作品状态
      await supabase
        .from('cloths')
        .update({ is_recent: false })
        .in('id', clothIds)
    }
  } catch (error) {
    console.error('Error cleaning up recent creations:', error)
  }
}
