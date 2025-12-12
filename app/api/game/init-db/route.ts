/**
 * 游戏数据库初始化API
 * Game Database Initialization API
 * 
 * POST /api/game/init-db - 初始化游戏数据库表
 * GET /api/game/init-db - 检查数据库状态
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GameConfig } from '@/lib/game/config'

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

export async function GET(request: NextRequest) {
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
      .filter(([_, exists]) => !exists)
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

export async function POST(request: NextRequest) {
  try {
    // 生产环境不允许通过API初始化数据库
    if (GameConfig.isProduction) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: '生产环境不允许通过API初始化数据库',
          userMessage: '请使用 Supabase SQL Editor 执行迁移脚本'
        }
      }, { status: 403 })
    }

    const supabase = await createClient()

    // 检查当前状态
    const tableStatus: Record<string, boolean> = {}
    const createdTables: string[] = []
    const existingTables: string[] = []
    const errors: string[] = []

    for (const table of REQUIRED_TABLES) {
      try {
        const { error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
          .limit(0)
        
        if (!error) {
          tableStatus[table] = true
          existingTables.push(table)
        } else {
          tableStatus[table] = false
        }
      } catch {
        tableStatus[table] = false
      }
    }

    // 返回状态信息和初始化指南
    const missingTables = REQUIRED_TABLES.filter(t => !tableStatus[t])

    return NextResponse.json({
      success: true,
      data: {
        existingTables,
        missingTables,
        message: missingTables.length > 0
          ? `请在 Supabase SQL Editor 中执行 supabase/migrations/game_system_init.sql 来创建缺失的表`
          : '所有表已存在',
        instructions: missingTables.length > 0 ? [
          '1. 打开 Supabase Dashboard',
          '2. 进入 SQL Editor',
          '3. 复制 supabase/migrations/game_system_init.sql 的内容',
          '4. 执行 SQL 脚本',
          '5. 刷新此页面确认初始化成功'
        ] : null
      }
    })

  } catch (error: any) {
    console.error('数据库初始化失败:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'DB_INIT_ERROR',
        message: error.message,
        userMessage: '数据库初始化失败'
      }
    }, { status: 500 })
  }
}
