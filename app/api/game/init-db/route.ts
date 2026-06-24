/**
 * 游戏数据库初始化API
 * Game Database Initialization API
 * 
 * POST /api/game/init-db - 初始化游戏数据库表
 * GET /api/game/init-db - 检查数据库状态
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 需要检查的表列表
const REQUIRED_TABLES = [
  'player_profile',
  'cloths',
  'cloth_scores',
  'user_inventory',
  'user_shops',
  'shop_listings',
  'transactions',
  'shop_visits',
  'shop_favorites'
]

// ============================================================================
// GET - 检查数据库状态
// ============================================================================

export async function GET() {
  try {
    const supabase = await createClient()

    // 检查每个表是否存在
    const tableStatus: Record<string, boolean> = {}
    
    for (const table of REQUIRED_TABLES) {
      try {
        const { error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
          .limit(0)
        
        tableStatus[table] = !error
      } catch {
        tableStatus[table] = false
      }
    }

    const allTablesExist = Object.values(tableStatus).every(v => v)
    const missingTables = Object.entries(tableStatus)
      .filter(([, exists]) => !exists)
      .map(([table]) => table)

    return NextResponse.json({
      success: true,
      data: {
        initialized: allTablesExist,
        tables: tableStatus,
        missingTables,
        message: allTablesExist 
          ? '数据库已完全初始化' 
          : `缺少 ${missingTables.length} 个表`
      }
    })

  } catch (error: any) {
    console.error('检查数据库状态失败:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'DB_CHECK_ERROR',
        message: error.message,
        userMessage: '检查数据库状态失败'
      }
    }, { status: 500 })
  }
}

// ============================================================================
// POST - 初始化数据库（仅开发环境）
// ============================================================================

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      status: 'deprecated',
      message: '该接口已迁移到 CLI（避免在 API 中写入/初始化数据）。',
      recommended: [
        'npm run cli:check-game-db',
        'npm run cli:check-game-db -- --env=.env.local',
        '请在 Supabase SQL Editor 执行: supabase/migrations/game_system_init.sql',
      ],
    },
    { status: 410 }
  )
}
