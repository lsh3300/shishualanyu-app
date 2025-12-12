/**
 * 保存到背包API
 * POST /api/inventory/save
 * 
 * 从"最近创作"移到背包，或直接保存新作品到背包
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'

export async function POST(request: NextRequest) {
  try {
    // 使用 Authorization header 认证
    const authHeader = request.headers.get('authorization')
    console.log('📦 保存到背包 - Authorization header:', authHeader ? '存在' : '不存在')
    
    const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '').trim() : null
    
    if (!token) {
      console.log('❌ 保存到背包 - token为空')
      return NextResponse.json(
        { error: '未授权访问', code: 'UNAUTHORIZED', message: '缺少认证token' },
        { status: 401 }
      )
    }
    
    console.log('📦 保存到背包 - token长度:', token.length)
    
    const supabase = createServiceClient()
    const { data, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !data?.user) {
      console.log('❌ 保存到背包 - 认证失败:', authError?.message)
      return NextResponse.json(
        { error: '认证失败', code: 'UNAUTHORIZED', message: authError?.message || '无效token' },
        { status: 401 }
      )
    }
    
    const userId = data.user.id
    console.log('✅ 保存到背包，用户ID:', userId)

    // 获取请求体
    const body = await request.json()
    const { cloth_id } = body

    if (!cloth_id) {
      return NextResponse.json(
        { error: '缺少cloth_id参数' },
        { status: 400 }
      )
    }

    // 检查作品是否属于当前用户
    const { data: cloth, error: clothError } = await supabase
      .from('cloths')
      .select('creator_id')
      .eq('id', cloth_id)
      .maybeSingle()

    if (clothError || !cloth) {
      console.error('作品不存在:', cloth_id)
      return NextResponse.json(
        { error: '作品不存在' },
        { status: 404 }
      )
    }

    if (cloth.creator_id !== userId) {
      console.error('无权限操作此作品:', { userId, creatorId: cloth.creator_id })
      return NextResponse.json(
        { error: '无权限操作此作品' },
        { status: 403 }
      )
    }

    // 优化版：使用 upsert 减少查询次数
    try {
      // 检查是否已在背包或最近创作中
      const { data: existing } = await supabase
        .from('user_inventory')
        .select('id, slot_type')
        .eq('user_id', userId)
        .eq('cloth_id', cloth_id)
        .maybeSingle()

      const now = new Date().toISOString()

      if (existing) {
        if (existing.slot_type === 'inventory') {
          return NextResponse.json({
            success: true,
            message: '作品已在背包中'
          })
        }
        
        // 从最近创作移到背包（并行更新）
        await Promise.all([
          supabase
            .from('user_inventory')
            .update({ slot_type: 'inventory', added_at: now })
            .eq('id', existing.id),
          supabase
            .from('cloths')
            .update({ status: 'in_inventory', is_recent: false })
            .eq('id', cloth_id)
        ])

        return NextResponse.json({
          success: true,
          message: '已从最近创作移至背包'
        })
      }

      // 添加到背包（并行操作）
      await Promise.all([
        supabase
          .from('user_inventory')
          .insert({
            user_id: userId,
            cloth_id: cloth_id,
            slot_type: 'inventory',
            added_at: now
          }),
        supabase
          .from('cloths')
          .update({ status: 'in_inventory', is_recent: false })
          .eq('id', cloth_id)
      ])

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
