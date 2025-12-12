/**
 * 背包API
 * Inventory API
 * 
 * GET /api/inventory - 获取用户背包内容
 * POST /api/inventory - 保存作品到背包
 * DELETE /api/inventory - 从背包删除作品
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getServerSupabase } from '@/lib/game/middleware/auth'
import { 
  getInventoryItems, 
  getInventoryCapacity,
  moveToInventory,
  removeFromInventory,
  setSupabaseClient
} from '@/lib/services/inventoryService'
import { 
  ValidationError,
  createErrorResponse 
} from '@/lib/game/errors'

// ============================================================================
// GET - 获取背包内容
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // 使用 Authorization header 认证（与 score API 一致）
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '').trim() : null
    
    if (!token) {
      return NextResponse.json(
        { error: '未授权访问', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }
    
    const { createServiceClient } = await import('@/lib/supabaseClient')
    const supabase = createServiceClient()
    const { data, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !data?.user) {
      return NextResponse.json(
        { error: '认证失败', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }
    
    const userId = data.user.id
    
    // 注入 supabase 客户端给 inventoryService
    setSupabaseClient(supabase)

    // 获取URL参数
    const url = new URL(request.url)
    const slotType = url.searchParams.get('slot_type') as 'inventory' | 'recent' | null

    // 并行获取背包列表和容量信息
    const [items, capacity] = await Promise.all([
      getInventoryItems(userId, slotType || undefined),
      getInventoryCapacity(userId)
    ])
    
    // 清理注入的客户端
    setSupabaseClient(null)

    // 分离最近创作和背包
    const recent = items.filter(item => item.slot_type === 'recent')
    const inventory = items.filter(item => item.slot_type === 'inventory')

    // 转换数据格式（评分已通过嵌套查询获取，无需额外查询）
    const enrichedRecent = enrichItemsWithScores(supabase, recent)
    const enrichedInventory = enrichItemsWithScores(supabase, inventory)

    return NextResponse.json({
      success: true,
      data: {
        recent: enrichedRecent,
        inventory: enrichedInventory,
        capacity: {
          current: capacity.current,
          max: capacity.max,
          recentCount: capacity.recentCount,
          maxRecent: capacity.maxRecent
        }
      }
    })

  } catch (error: unknown) {
    console.error('获取背包失败:', error)
    const { status, body } = createErrorResponse(error)
    return NextResponse.json(body, { status })
  }
}

// ============================================================================
// POST - 保存作品到背包
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // 使用 Authorization header 认证
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '').trim() : null
    
    if (!token) {
      return NextResponse.json(
        { error: '未授权访问', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }
    
    const { createServiceClient } = await import('@/lib/supabaseClient')
    const supabase = createServiceClient()
    const { data, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !data?.user) {
      return NextResponse.json(
        { error: '认证失败', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }
    
    const userId = data.user.id

    const body = await request.json()
    const { cloth_id } = body

    if (!cloth_id) {
      throw new ValidationError('缺少 cloth_id 参数', 'cloth_id')
    }
    
    // 注入 supabase 客户端
    setSupabaseClient(supabase)

    // 默认动作是移动到背包
    const result = await moveToInventory(userId, cloth_id)
    
    // 清理注入的客户端
    setSupabaseClient(null)

    return NextResponse.json({
      success: result.success,
      data: result.item,
      message: result.message
    })

  } catch (error: unknown) {
    console.error('保存到背包失败:', error)
    const { status, body } = createErrorResponse(error)
    return NextResponse.json(body, { status })
  }
}

// ============================================================================
// DELETE - 从背包删除作品
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    // 使用 Authorization header 认证
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '').trim() : null
    
    if (!token) {
      return NextResponse.json(
        { error: '未授权访问', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }
    
    const { createServiceClient } = await import('@/lib/supabaseClient')
    const supabase = createServiceClient()
    const { data, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !data?.user) {
      return NextResponse.json(
        { error: '认证失败', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }
    
    const userId = data.user.id

    const url = new URL(request.url)
    const clothId = url.searchParams.get('cloth_id')

    if (!clothId) {
      throw new ValidationError('缺少 cloth_id 参数', 'cloth_id')
    }
    
    // 注入 supabase 客户端
    setSupabaseClient(supabase)

    await removeFromInventory(userId, clothId)
    
    // 清理注入的客户端
    setSupabaseClient(null)

    return NextResponse.json({
      success: true,
      message: '已从背包删除'
    })

  } catch (error: unknown) {
    console.error('删除背包项失败:', error)
    const { status, body } = createErrorResponse(error)
    return NextResponse.json(body, { status })
  }
}

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 为背包项添加评分信息并转换数据格式（同步版本，无额外查询）
 * 
 * 将数据库格式转换为前端组件期望的格式：
 * - cloth.layers -> cloth.cloth_data.layers
 * - cloth.cloth_scores -> cloth.score_data
 */
function enrichItemsWithScores(supabase: any, items: any[]): any[] {
  return items.map((item) => {
    const cloth = item.cloth
    if (!cloth) {
      return item
    }

    // 获取最新的评分记录（已通过嵌套查询获取）
    const scores = cloth.cloth_scores || []
    const latestScore = scores.length > 0 ? scores[0] : null

    // 转换为前端期望的格式
    return {
      ...item,
      cloth: {
        id: cloth.id,
        cloth_data: {
          layers: cloth.layers || []
        },
        created_at: cloth.created_at,
        status: cloth.status,
        score_data: latestScore ? {
          total_score: latestScore.total_score,
          grade: latestScore.grade,
          dimensions: {
            color_score: latestScore.color_score || 0,
            pattern_score: latestScore.pattern_score || 0,
            creativity_score: latestScore.creativity_score || 0,
            technique_score: latestScore.technique_score || 0
          }
        } : null
      }
    }
  })
}
