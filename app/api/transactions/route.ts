/**
 * 交易记录API
 * GET /api/transactions - 获取用户的交易记录
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseClient'

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

export async function GET(request: NextRequest) {
  try {
    const { userId, error: authError } = await authenticateUser(request)
    
    if (authError || !userId) {
      return NextResponse.json(
        { error: '未授权访问', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }
    
    const supabase = createServiceClient()
    
    // 获取查询参数
    const url = new URL(request.url)
    const type = url.searchParams.get('type') || 'sell' // 'sell' 或 'buy'
    const limit = parseInt(url.searchParams.get('limit') || '50')

    // 根据类型查询
    const column = type === 'sell' ? 'seller_id' : 'buyer_id'

    // 一次性获取所有关联数据，避免 N+1 查询
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select(`
        *,
        cloth:cloths (
          id,
          layers,
          status,
          created_at,
          cloth_scores (
            total_score,
            grade,
            color_score,
            pattern_score,
            creativity_score,
            technique_score
          )
        )
      `)
      .eq(column, userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (txError) {
      console.error('获取交易记录失败:', txError)
      return NextResponse.json(
        { error: '获取交易记录失败', code: 'TX_FETCH_ERROR' },
        { status: 500 }
      )
    }

    // 转换数据格式（评分已通过嵌套查询获取，无需额外查询）
    const transactionsWithScores = (transactions || []).map((tx) => {
      if (tx.cloth) {
        const scores = tx.cloth.cloth_scores || []
        const latestScore = scores.length > 0 ? scores[0] : null
        return {
          ...tx,
          cloth: {
            id: tx.cloth.id,
            layers: tx.cloth.layers,
            status: tx.cloth.status,
            created_at: tx.cloth.created_at,
            score_data: latestScore
          }
        }
      }
      return tx
    })

    return NextResponse.json({
      success: true,
      data: transactionsWithScores
    })

  } catch (error) {
    console.error('交易记录API错误:', error)
    return NextResponse.json(
      { error: '服务器错误', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
