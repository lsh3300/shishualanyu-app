/**
 * 保存到最近创作API
 * POST /api/inventory/save-recent
 * 
 * 在作品评分后自动调用，保存到"最近创作"列表
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'

// 用户认证函数（从 Authorization header 获取）
async function authenticateUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '').trim() : null
  
  if (!token) {
    return { userId: null, error: 'Missing authorization token' }
  }
  
  const supabase = createServiceClient()
  const { data, error } = await supabase.auth.getUser(token)
  
  if (error || !data?.user) {
    return { userId: null, error: 'Invalid token' }
  }
  
  return { userId: data.user.id, error: null }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 收到保存到最近创作请求')

    // 验证用户
    const { userId, error: authError } = await authenticateUser(request)
    
    if (authError || !userId) {
      console.error('🔐 用户验证失败:', authError)
      return NextResponse.json(
        { error: '未授权访问', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }
    
    const supabase = createServiceClient()
    
    // 获取请求体
    const body = await request.json()
    const { cloth_id, clothData } = body

    console.log('📋 请求参数:', { cloth_id, hasClothData: !!clothData, userId })

    if (!cloth_id) {
      console.error('❌ 缺少cloth_id参数')
      return NextResponse.json(
        { error: '缺少cloth_id参数', code: 'MISSING_PARAMETER' },
        { status: 400 }
      )
    }

    // 检查作品是否属于当前用户
    const { data: cloth, error: clothError } = await supabase
      .from('cloths')
      .select('creator_id')
      .eq('id', cloth_id)
      .maybeSingle()

    if (clothError) {
      console.error('❌ 获取作品信息错误:', clothError)
      return NextResponse.json(
        { error: '获取作品信息失败', code: 'CLOTH_FETCH_ERROR', details: clothError.message },
        { status: 500 }
      )
    }

    if (!cloth) {
      console.error('❌ 作品不存在:', cloth_id)
      return NextResponse.json(
        { error: '作品不存在', code: 'CLOTH_NOT_FOUND' },
        { status: 404 }
      )
    }

    if (cloth.creator_id !== userId) {
      console.error('❌ 无权限操作此作品:', { userId, clothCreatorId: cloth.creator_id })
      return NextResponse.json(
        { error: '无权限操作此作品', code: 'UNAUTHORIZED' },
        { status: 403 }
      )
    }

    // 检查是否已存在于背包或最近创作中
    const { data: existing, error: existingError } = await supabase
      .from('user_inventory')
      .select('id, slot_type')
      .eq('user_id', userId)
      .eq('cloth_id', cloth_id)
      .maybeSingle()

    if (existingError) {
      console.error('❌ 检查作品是否已存在错误:', existingError)
      return NextResponse.json(
        { error: '检查作品状态失败', code: 'CHECK_EXISTING_ERROR', details: existingError.message },
        { status: 500 }
      )
    }

    if (existing) {
      // 如果已经在背包中，不做任何操作
      if (existing.slot_type === 'inventory') {
        console.log('✅ 作品已在背包中，无需操作:', cloth_id)
        return NextResponse.json({
          success: true,
          message: '作品已在背包中',
          already_saved: true
        })
      }
      
      // 如果已在最近创作中，更新时间
      console.log('🔄 作品已在最近创作中，更新时间:', cloth_id)
      const { error: updateError } = await supabase
        .from('user_inventory')
        .update({
          added_at: new Date().toISOString()
        })
        .eq('id', existing.id)

      if (updateError) {
        console.error('❌ 更新最近创作时间错误:', updateError)
        return NextResponse.json(
          { error: '更新最近创作失败', code: 'UPDATE_RECENT_ERROR', details: updateError.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: '已更新到最近创作',
        already_in_recent: true
      })
    }

    // 添加到最近创作
    console.log('➕ 添加到最近创作:', cloth_id)
    const { error: insertError } = await supabase
      .from('user_inventory')
      .insert({
        user_id: userId,
        cloth_id,
        slot_type: 'recent',
        added_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('❌ 添加到最近创作错误:', insertError)
      throw new Error(`添加到最近创作失败: ${insertError.message}`)
    }

    // 更新作品状态
    console.log('🔄 更新作品状态为draft:', cloth_id)
    const { error: updateStatusError } = await supabase
      .from('cloths')
      .update({
        status: 'draft',
        is_recent: true
      })
      .eq('id', cloth_id)

    if (updateStatusError) {
      console.error('❌ 更新作品状态错误:', updateStatusError)
      // 不抛出错误，继续执行，因为这不是核心功能
    }

    // 清理超过5个的旧记录
    console.log('🧹 清理旧的最近创作记录')
    await cleanupRecentCreations(userId)

    console.log('✅ 保存到最近创作成功:', cloth_id)
    return NextResponse.json({
      success: true,
      message: '已自动保存到最近创作',
      cloth_id
    })

  } catch (error) {
    console.error('💥 保存到最近创作发生未知错误:', error)
    const errorMessage = error instanceof Error ? error.message : '保存失败'
    return NextResponse.json(
      { 
        error: errorMessage, 
        code: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

/**
 * 清理"最近创作"，保留最新5个
 */
async function cleanupRecentCreations(userId: string): Promise<void> {
  const supabase = createServiceClient()

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
