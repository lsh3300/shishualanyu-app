import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { scoreCloth } from '@/lib/game/scoring/score-calculator'
import type { ClothLayer, ScoreSubmitResult } from '@/types/game.types'

/**
 * POST /api/game/score
 * 提交作品评分
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies })

    // 验证用户
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // 测试模式：如果没有用户，使用固定的测试用户ID（有效UUID格式）
    const userId = user?.id || '00000000-0000-0000-0000-000000000000'
    const isTestMode = !user
    
    if (isTestMode) {
      console.log('🧪 测试模式：使用临时用户ID', userId)
    }

    // 解析请求体
    const body = await request.json()
    const { cloth_id, layers } = body as {
      cloth_id: string
      layers: ClothLayer[]
    }

    if (!cloth_id || !layers || !Array.isArray(layers)) {
      return NextResponse.json(
        { success: false, error: '请求参数错误' },
        { status: 400 }
      )
    }

    // 计算评分
    const scoreResult = scoreCloth(layers)

    // 测试模式：创建 mock 结果
    let submitResult: ScoreSubmitResult
    
    if (isTestMode) {
      // 确保 cloth 记录存在
      const { data: existingCloth } = await supabase
        .from('cloths')
        .select('id')
        .eq('id', cloth_id)
        .single()

      if (!existingCloth) {
        console.log('🧪 测试模式：创建 cloth 记录')
        await supabase
          .from('cloths')
          .insert({
            id: cloth_id,
            creator_id: userId,
            layers: layers,
            status: 'drifting',
            layer_count: layers.length,
            created_at: new Date().toISOString()
          })
      }

      submitResult = {
        score_id: `test-score-${Date.now()}`,
        dimensions: scoreResult.dimensions,
        total_score: scoreResult.total,
        grade: scoreResult.grade,
        exp_reward: scoreResult.grade === 'SSS' ? 200 :
                    scoreResult.grade === 'SS' ? 150 :
                    scoreResult.grade === 'S' ? 100 :
                    scoreResult.grade === 'A' ? 70 :
                    scoreResult.grade === 'B' ? 50 : 30,
        currency_reward: scoreResult.grade === 'SSS' ? 100 :
                         scoreResult.grade === 'SS' ? 70 :
                         scoreResult.grade === 'S' ? 50 :
                         scoreResult.grade === 'A' ? 30 :
                         scoreResult.grade === 'B' ? 20 : 10,
        leveled_up: false,
        old_level: 1,
        new_level: 1
      }

      console.log('🎯 测试模式评分结果:', submitResult)
    } else {

      // 正式模式：调用数据库函数提交评分
      const { data: result, error: scoreError } = await supabase
        .rpc('submit_cloth_score', {
          p_cloth_id: cloth_id,
          p_user_id: userId,
          p_color_score: scoreResult.dimensions.color_score,
          p_pattern_score: scoreResult.dimensions.pattern_score,
          p_creativity_score: scoreResult.dimensions.creativity_score,
          p_technique_score: scoreResult.dimensions.technique_score
        })

      if (scoreError) {
        console.error('评分提交失败:', scoreError)
        return NextResponse.json(
          { success: false, error: '评分提交失败' },
          { status: 500 }
        )
      }

      // 返回结果（包含评分维度）
      const dbResult = result[0]
      submitResult = {
        ...dbResult,
        dimensions: scoreResult.dimensions  // 添加评分维度
      }
    }

    // 自动保存到最近创作（使用同一认证上下文）
    try {
      // 检查是否已存在于背包或最近创作中
      const { data: existing } = await supabase
        .from('user_inventory')
        .select('id, slot_type')
        .eq('user_id', userId)
        .eq('cloth_id', cloth_id)
        .single()

      if (!existing) {
        // 添加到最近创作
        await supabase
          .from('user_inventory')
          .insert({
            user_id: userId,
            cloth_id,
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
          .eq('id', cloth_id)

        // 清理超过5个的旧记录
        await cleanupRecentCreations(supabase, userId)
        
        console.log('✅ 自动保存到最近创作成功')
      } else if (existing.slot_type === 'recent') {
        // 如果已在最近创作中，更新时间
        await supabase
          .from('user_inventory')
          .update({ added_at: new Date().toISOString() })
          .eq('id', existing.id)
        
        console.log('✅ 更新最近创作时间')
      }
    } catch (saveError) {
      // 保存失败不影响评分结果返回
      console.error('⚠️ 自动保存失败（不影响评分）:', saveError)
    }

    return NextResponse.json({
      success: true,
      data: submitResult
    })

  } catch (error: any) {
    console.error('评分API错误:', error)
    return NextResponse.json(
      { success: false, error: error.message || '服务器错误' },
      { status: 500 }
    )
  }
}

/**
 * 清理"最近创作"，保留最新5个
 */
async function cleanupRecentCreations(supabase: any, userId: string): Promise<void> {
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
      const deleteIds = toDelete.map((item: any) => item.id)
      const clothIds = toDelete.map((item: any) => item.cloth_id)

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
    console.error('清理最近创作失败:', error)
  }
}

/**
 * GET /api/game/score/:cloth_id
 * 获取作品的评分记录
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies })
    
    // 从URL获取cloth_id
    const url = new URL(request.url)
    const cloth_id = url.searchParams.get('cloth_id')

    if (!cloth_id) {
      return NextResponse.json(
        { success: false, error: '缺少cloth_id参数' },
        { status: 400 }
      )
    }

    // 查询评分记录
    const { data, error } = await supabase
      .from('cloth_scores')
      .select('*')
      .eq('cloth_id', cloth_id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { success: false, error: '查询失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error: any) {
    console.error('查询评分API错误:', error)
    return NextResponse.json(
      { success: false, error: error.message || '服务器错误' },
      { status: 500 }
    )
  }
}
