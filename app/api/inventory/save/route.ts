/**
 * 保存到背包API
 * POST /api/inventory/save
 * 
 * 从"最近创作"移到背包，或直接保存新作品到背包
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
        .select('creator_id')
        .eq('id', cloth_id)
        .maybeSingle()

      if (clothError || !cloth) {
        return NextResponse.json(
          { error: '作品不存在' },
          { status: 404 }
        )
      }

      if (cloth.creator_id !== user.id) {
        return NextResponse.json(
          { error: '无权限操作此作品' },
          { status: 403 }
        )
      }
    } else {
      console.log('🧪 测试模式：跳过所有者检查')
    }

    // 直接保存到背包（简化版，适合测试模式）
    try {
      // 检查是否已在背包或最近创作中
      const { data: existing } = await supabase
        .from('user_inventory')
        .select('id, slot_type')
        .eq('user_id', userId)
        .eq('cloth_id', cloth_id)
        .maybeSingle()

      if (existing) {
        if (existing.slot_type === 'inventory') {
          // 已在背包中
          return NextResponse.json({
            success: true,
            message: '作品已在背包中'
          })
        } else {
          // 从最近创作移到背包
          await supabase
            .from('user_inventory')
            .update({
              slot_type: 'inventory',
              added_at: new Date().toISOString()
            })
            .eq('id', existing.id)

          // 更新作品状态为completed
          await supabase
            .from('cloths')
            .update({ status: 'completed' })
            .eq('id', cloth_id)

          return NextResponse.json({
            success: true,
            message: '已从最近创作移至背包'
          })
        }
      }

      // 添加到背包
      await supabase
        .from('user_inventory')
        .insert({
          user_id: userId,
          cloth_id: cloth_id,
          slot_type: 'inventory',
          added_at: new Date().toISOString()
        })

      // 更新作品状态为completed
      await supabase
        .from('cloths')
        .update({ status: 'completed' })
        .eq('id', cloth_id)

      return NextResponse.json({
        success: true,
        message: '已保存到背包'
      })
    } catch (saveError: any) {
      console.error('保存到背包失败:', saveError)
      return NextResponse.json(
        { error: saveError.message || '保存失败' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Error saving to inventory:', error)
    return NextResponse.json(
      { error: '保存失败' },
      { status: 500 }
    )
  }
}
