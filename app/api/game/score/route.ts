/**
 * 游戏评分API
 * Game Scoring API
 * 
 * POST /api/game/score - 提交作品评分
 * GET /api/game/score?cloth_id=xxx - 获取作品评分记录
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'
import { scoreCloth, getGradeRewards } from '@/lib/game/scoring/score-calculator'
import { 
  GameError, 
  ValidationError, 
  NotFoundError,
  toGameError,
  createErrorResponse 
} from '@/lib/game/errors'
import type { ClothLayer, ScoreSubmitResult } from '@/types/game.types'

// 用户认证函数
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

// ============================================================================
// POST - 提交作品评分
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // 认证检查
    const { userId, error: authError } = await authenticateUser(request)
    
    if (authError || !userId) {
      return NextResponse.json(
        { error: '未授权访问', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }
    
    const supabase = createServiceClient()

    // 解析请求体
    const body = await request.json()
    const { cloth_id, layers } = body as {
      cloth_id: string
      layers: ClothLayer[]
    }

    // 参数验证
    if (!cloth_id) {
      throw new ValidationError('缺少 cloth_id 参数', 'cloth_id')
    }
    if (!layers || !Array.isArray(layers)) {
      throw new ValidationError('缺少 layers 参数或格式错误', 'layers')
    }

    // 计算评分
    const scoreResult = scoreCloth(layers)
    const rewards = getGradeRewards(scoreResult.grade)

    // 1. 确保 cloth 记录存在
    const { data: existingCloth, error: queryError } = await supabase
      .from('cloths')
      .select('id, creator_id')
      .eq('id', cloth_id)
      .maybeSingle()

    // 如果查询出错（不是"未找到"错误）
    if (queryError && queryError.code !== 'PGRST116') {
      console.error('查询 cloth 记录失败:', queryError)
      throw new GameError('查询作品失败', 'QUERY_CLOTH_ERROR', 500)
    }

    if (!existingCloth) {
      // 创建 cloth 记录
      console.log('创建新的 cloth 记录:', { cloth_id, userId, layerCount: layers.length })
      
      // 使用 RPC 调用绕过 RLS，或者直接禁用 RLS 检查
      const { error: createError } = await supabase.rpc('create_cloth_bypass_rls', {
        p_cloth_id: cloth_id,
        p_creator_id: userId,
        p_layers: layers,
        p_layer_count: layers.length
      })

      if (createError) {
        console.error('创建 cloth 记录失败:', createError)
        console.error('详细错误:', JSON.stringify(createError, null, 2))
        
        // 如果 RPC 不存在，尝试直接插入（需要确保 Service Role Key 正确配置）
        console.log('尝试直接插入...')
        const { error: directError } = await supabase
          .from('cloths')
          .insert({
            id: cloth_id,
            creator_id: userId,
            layers: layers,
            status: 'draft',
            layer_count: layers.length,
            created_at: new Date().toISOString()
          })
        
        if (directError) {
          console.error('直接插入也失败:', directError)
          throw new GameError('创建作品记录失败', 'CREATE_CLOTH_ERROR', 500)
        }
      }
      console.log('✅ Cloth 记录创建成功')
    } else {
      console.log('✅ Cloth 记录已存在:', cloth_id)
    }

    // 2. 创建评分记录
    const { data: scoreRecord, error: scoreError } = await supabase
      .from('cloth_scores')
      .insert({
        cloth_id,
        user_id: userId,
        color_score: scoreResult.dimensions.color_score,
        pattern_score: scoreResult.dimensions.pattern_score,
        creativity_score: scoreResult.dimensions.creativity_score,
        technique_score: scoreResult.dimensions.technique_score,
        total_score: scoreResult.total,
        grade: scoreResult.grade,
        exp_reward: rewards.exp,
        currency_reward: rewards.currency
      })
      .select()
      .single()

    if (scoreError) {
      console.error('创建评分记录失败:', scoreError)
      throw new GameError('保存评分失败', 'SAVE_SCORE_ERROR', 500)
    }

    // 3. 更新玩家档案（经验和货币）
    let leveledUp = false
    let oldLevel = 1
    let newLevel = 1

    // 先尝试获取玩家档案
    let { data: profile } = await supabase
      .from('player_profile')
      .select('level, exp, currency, total_score, highest_score, total_cloths_created')
      .eq('user_id', userId)
      .single()

    // 如果档案不存在，自动创建
    if (!profile) {
      console.log('📝 自动创建玩家档案...')
      const { data: newProfile, error: createError } = await supabase
        .from('player_profile')
        .insert({
          user_id: userId,
          dye_house_name: '无名染坊',
          level: 1,
          exp: 0,
          currency: 100,
          total_cloths_created: 0,
          total_score: 0,
          highest_score: 0
        })
        .select()
        .single()
      
      if (createError) {
        console.error('创建玩家档案失败:', createError)
        // 不抛出错误，继续执行，只是不更新档案
      } else {
        profile = newProfile
        console.log('✅ 玩家档案创建成功')
      }
    }

    if (profile) {
      oldLevel = profile.level || 1
      const newExp = (profile.exp || 0) + rewards.exp
      const newCurrency = (profile.currency || 0) + rewards.currency

      // 简单的升级检查（实际应该用数据库函数）
      const expForNextLevel = Math.floor(100 * Math.pow(oldLevel, 1.5))
      if (newExp >= expForNextLevel) {
        newLevel = oldLevel + 1
        leveledUp = true
      } else {
        newLevel = oldLevel
      }

      await supabase
        .from('player_profile')
        .update({
          exp: newExp,
          currency: newCurrency,
          level: newLevel,
          total_score: (profile.total_score || 0) + scoreResult.total,
          highest_score: Math.max(profile.highest_score || 0, scoreResult.total),
          total_cloths_created: (profile.total_cloths_created || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
    }

    // 4. 自动保存到最近创作
    await saveToRecentCreations(supabase, userId, cloth_id)

    // 构建返回结果
    const submitResult: ScoreSubmitResult = {
      score_id: scoreRecord.id,
      dimensions: scoreResult.dimensions,
      total_score: scoreResult.total,
      grade: scoreResult.grade,
      exp_reward: rewards.exp,
      currency_reward: rewards.currency,
      leveled_up: leveledUp,
      old_level: oldLevel,
      new_level: newLevel
    }

    return NextResponse.json({
      success: true,
      data: submitResult
    })

  } catch (error: unknown) {
    console.error('评分API错误:', error)
    const { status, body } = createErrorResponse(error)
    return NextResponse.json(body, { status })
  }
}

// ============================================================================
// GET - 获取作品评分记录
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    
    // 从URL获取cloth_id
    const url = new URL(request.url)
    const cloth_id = url.searchParams.get('cloth_id')

    if (!cloth_id) {
      throw new ValidationError('缺少 cloth_id 参数', 'cloth_id')
    }

    // 查询评分记录
    const { data, error } = await supabase
      .from('cloth_scores')
      .select('*')
      .eq('cloth_id', cloth_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('查询评分失败:', error)
      throw new GameError('查询评分失败', 'QUERY_SCORE_ERROR', 500)
    }

    if (!data || data.length === 0) {
      throw new NotFoundError('评分记录')
    }

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error: unknown) {
    console.error('查询评分API错误:', error)
    const { status, body } = createErrorResponse(error)
    return NextResponse.json(body, { status })
  }
}

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 保存到最近创作
 */
async function saveToRecentCreations(
  supabase: any, 
  userId: string, 
  clothId: string
): Promise<void> {
  try {
    // 检查是否已存在
    const { data: existing } = await supabase
      .from('user_inventory')
      .select('id, slot_type')
      .eq('user_id', userId)
      .eq('cloth_id', clothId)
      .single()

    if (!existing) {
      // 添加到最近创作
      await supabase
        .from('user_inventory')
        .insert({
          user_id: userId,
          cloth_id: clothId,
          slot_type: 'recent',
          added_at: new Date().toISOString()
        })

      // 更新作品状态
      await supabase
        .from('cloths')
        .update({
          status: 'draft',
          is_recent: true
        })
        .eq('id', clothId)

      // 清理超过5个的旧记录
      await cleanupRecentCreations(supabase, userId)
      
      console.log('✅ 自动保存到最近创作成功')
    } else if (existing.slot_type === 'recent') {
      // 更新时间
      await supabase
        .from('user_inventory')
        .update({ added_at: new Date().toISOString() })
        .eq('id', existing.id)
    }
  } catch (error) {
    console.error('⚠️ 自动保存失败（不影响评分）:', error)
  }
}

/**
 * 清理最近创作，保留最新5个
 */
async function cleanupRecentCreations(
  supabase: any, 
  userId: string
): Promise<void> {
  try {
    const { data: recent } = await supabase
      .from('user_inventory')
      .select('id, cloth_id')
      .eq('user_id', userId)
      .eq('slot_type', 'recent')
      .order('added_at', { ascending: false })

    if (recent && recent.length > 5) {
      const toDelete = recent.slice(5)
      const deleteIds = toDelete.map((item: any) => item.id)
      const clothIds = toDelete.map((item: any) => item.cloth_id)

      await supabase
        .from('user_inventory')
        .delete()
        .in('id', deleteIds)

      await supabase
        .from('cloths')
        .update({ is_recent: false })
        .in('id', clothIds)
    }
  } catch (error) {
    console.error('清理最近创作失败:', error)
  }
}
