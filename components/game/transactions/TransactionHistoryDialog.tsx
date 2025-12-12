'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, TrendingUp, ShoppingCart } from 'lucide-react'
import { ClothPreview } from '@/components/game/preview/ClothPreview'
import { getSupabaseClient } from '@/lib/supabaseClient'
import type { ClothLayer } from '@/types/game.types'

interface Transaction {
  id: string
  cloth_id: string
  seller_id: string
  buyer_id: string | null
  price: number
  actual_price: number
  transaction_type: 'player_buy' | 'system_buy'
  created_at: string
  cloth?: {
    id: string
    layers?: ClothLayer[]
    score_data?: {
      grade: string
      total_score: number
    }
  }
  buyer_name?: string
}

interface TransactionHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * 交易记录对话框
 */
export function TransactionHistoryDialog({
  open,
  onOpenChange
}: TransactionHistoryDialogProps) {
  const [activeTab, setActiveTab] = useState<'sell' | 'buy'>('sell')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchTransactions()
    }
  }, [open, activeTab])

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) return

      const response = await fetch(`/api/transactions?type=${activeTab}&limit=50`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const result = await response.json()
      if (result.success) {
        setTransactions(result.data || [])
      }
    } catch (error) {
      console.error('获取交易记录失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>交易记录</DialogTitle>
        </DialogHeader>

        {/* 标签切换 */}
        <div className="flex gap-2 border-b border-gray-200 pb-2">
          <Button
            variant={activeTab === 'sell' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('sell')}
            className="gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            我的销售
          </Button>
          <Button
            variant={activeTab === 'buy' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('buy')}
            className="gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            我的购买
          </Button>
        </div>

        {/* 交易列表 */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-3">📋</div>
              <p>暂无{activeTab === 'sell' ? '销售' : '购买'}记录</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  {/* 作品预览 */}
                  <div className="w-14 h-14 rounded-lg overflow-hidden border border-gray-300 flex-shrink-0">
                    <ClothPreview
                      layers={tx.cloth?.layers || []}
                      className="w-full h-full"
                    />
                  </div>

                  {/* 交易信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {tx.cloth?.score_data && (
                        <span className="text-sm font-medium">
                          {tx.cloth.score_data.grade} · {tx.cloth.score_data.total_score}分
                        </span>
                      )}
                      {tx.transaction_type === 'system_buy' && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                          系统收购
                        </span>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(tx.created_at)}
                      {activeTab === 'sell' && tx.buyer_id && (
                        <span className="ml-2">
                          买家: {tx.buyer_name || `用户${tx.buyer_id.substring(0, 6)}`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 价格 */}
                  <div className="text-right">
                    <div className={`text-lg font-bold ${activeTab === 'sell' ? 'text-green-600' : 'text-red-600'}`}>
                      {activeTab === 'sell' ? '+' : '-'}{tx.actual_price} 币
                    </div>
                    {tx.price !== tx.actual_price && (
                      <div className="text-xs text-gray-400 line-through">
                        原价 {tx.price} 币
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 统计信息 */}
        {!loading && transactions.length > 0 && (
          <div className="border-t border-gray-200 pt-3 mt-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                共 {transactions.length} 条记录
              </span>
              <span className={activeTab === 'sell' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                {activeTab === 'sell' ? '总收入' : '总支出'}: {' '}
                {transactions.reduce((sum, tx) => sum + tx.actual_price, 0)} 币
              </span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
