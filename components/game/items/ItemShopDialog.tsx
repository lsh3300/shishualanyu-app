'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, ShoppingCart, Check, Sparkles, Zap, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/auth-context'
import { fetchJson } from '@/lib/fetch-json'
import { useItemShopData } from '@/hooks/game/use-item-shop-data'

interface ItemShopDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userCurrency: number
  onPurchaseSuccess: () => void
}

/**
 * 道具商城对话框
 */
export function ItemShopDialog({
  open,
  onOpenChange,
  userCurrency,
  onPurchaseSuccess
}: ItemShopDialogProps) {
  const { getToken } = useAuth()
  const { data, loading, mutate } = useItemShopData(open)

  const items = data?.items ?? []
  const userItems = data?.userItems ?? {}
  const activeItems = data?.activeItems ?? {}
  const [purchasingId, setPurchasingId] = useState<string | null>(null)
  const [usingId, setUsingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const handlePurchase = async (itemId: string) => {
    const token = await getToken()
    if (!token) {
      toast.error('请先登录')
      return
    }

    setPurchasingId(itemId)
    try {
      const result = await fetchJson<{ success: boolean; message?: string; error?: { userMessage?: string } }>(
        '/api/items/purchase',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ item_id: itemId, quantity: 1 }),
          timeoutMs: 12000,
          retries: 1,
        }
      )
      
      if (result.success) {
        toast.success(result.message)
        await mutate()
        onPurchaseSuccess()
      } else {
        toast.error(result.error?.userMessage || '购买失败')
      }
    } catch (error) {
      console.error('购买道具失败:', error)
      toast.error('购买失败，请稍后重试')
    } finally {
      setPurchasingId(null)
    }
  }

  const handleUse = async (itemId: string) => {
    const token = await getToken()
    if (!token) {
      toast.error('请先登录')
      return
    }

    setUsingId(itemId)
    try {
      const result = await fetchJson<{ success: boolean; message?: string; error?: { userMessage?: string } }>(
        '/api/items/use',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ item_id: itemId, quantity: 1 }),
          timeoutMs: 12000,
          retries: 1,
        }
      )
      
      if (result.success) {
        toast.success(result.message)
        await mutate()
        onPurchaseSuccess()
      } else {
        toast.error(result.error?.userMessage || '使用失败')
      }
    } catch (error) {
      console.error('使用道具失败:', error)
      toast.error('使用失败，请稍后重试')
    } finally {
      setUsingId(null)
    }
  }

  const handleToggleActive = async (itemId: string) => {
    const token = await getToken()
    if (!token) {
      toast.error('请先登录')
      return
    }

    setTogglingId(itemId)
    try {
      const result = await fetchJson<
        { success: boolean; message?: string; data?: { is_active: boolean }; error?: { userMessage?: string } }
      >('/api/items/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ item_id: itemId }),
        timeoutMs: 12000,
        retries: 1,
      })
      
      if (result.success) {
        toast.success(result.message)
        const nextActive = result.data?.is_active
        if (typeof nextActive === 'boolean') {
          await mutate(
            (prev) => {
              if (!prev) return prev
              return {
                ...prev,
                activeItems: {
                  ...prev.activeItems,
                  [itemId]: nextActive,
                },
              }
            },
            { revalidate: false }
          )
        }
      } else {
        toast.error(result.error?.userMessage || '操作失败')
      }
    } catch (error) {
      console.error('切换道具状态失败:', error)
      toast.error('操作失败')
    } finally {
      setTogglingId(null)
    }
  }

  const canAfford = (price: number) => userCurrency >= price
  const isOwned = (itemId: string, type: string) => type === 'permanent' && (userItems[itemId] || 0) > 0
  const getQuantity = (itemId: string) => userItems[itemId] || 0
  const isActive = (itemId: string) => activeItems[itemId] ?? true

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-[calc(100%-1.25rem)] flex-col overflow-hidden rounded-2xl p-4 sm:max-w-2xl sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            道具商城
          </DialogTitle>
          <DialogDescription className="sr-only">
            购买和使用各种道具来增强你的游戏体验
          </DialogDescription>
        </DialogHeader>

        {/* 货币显示和刷新按钮 */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void mutate()}
            disabled={loading}
            className="w-fit gap-1 text-gray-500"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-3 py-2 sm:px-4">
            <span className="text-sm text-yellow-700">当前余额: </span>
            <span className="font-bold text-yellow-700">💰 {userCurrency} 币</span>
          </div>
        </div>

        {/* 道具列表 */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {items.map((item) => {
                const owned = isOwned(item.id, item.type)
                const affordable = canAfford(item.price)
                const quantity = getQuantity(item.id)
                const hasItem = quantity > 0

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      owned 
                        ? 'bg-green-50 border-green-200' 
                        : hasItem && item.type === 'consumable'
                          ? 'bg-blue-50 border-blue-200'
                          : affordable 
                            ? 'bg-white border-gray-200 hover:border-blue-300' 
                            : 'bg-gray-50 border-gray-200 opacity-75'
                    }`}
                  >
                    <div className="flex flex-col gap-3">
                      {/* 图标 */}
                      <div className="flex items-start gap-3">
                        <div className="text-3xl leading-none">{item.icon}</div>

                        {/* 信息 */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-800 leading-none">{item.name}</h3>
                            {item.type === 'permanent' && (
                              <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                                永久
                              </span>
                            )}
                            {owned && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                已拥有
                              </span>
                            )}
                            {quantity > 0 && item.type === 'consumable' && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                持有 {quantity}
                              </span>
                            )}
                          </div>

                          <p className="mt-2 text-sm leading-6 text-gray-500 line-clamp-3">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* 价格和操作按钮 */}
                      <div className="mt-1 rounded-2xl bg-slate-50/80 px-3 py-3">
                        <div className="flex items-end justify-between gap-3">
                          <div>
                            <div className="text-[11px] font-medium tracking-wide text-gray-400">价格</div>
                            <div className="mt-1 flex items-center gap-1 text-2xl font-bold leading-none text-yellow-600">
                              <span className="text-base">💰</span>
                              <span>{item.price}</span>
                              <span className="text-sm font-semibold">币</span>
                            </div>
                          </div>
                          
                          <div className="flex w-[112px] shrink-0 flex-col gap-2">
                            {/* 使用按钮 - 消耗品有库存时显示 */}
                            {item.type === 'consumable' && quantity > 0 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUse(item.id)}
                                disabled={usingId === item.id}
                                className="h-9 w-full gap-1 border-green-300 text-green-700 hover:bg-green-50"
                              >
                                {usingId === item.id ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    使用中
                                  </>
                                ) : (
                                  <>
                                    <Zap className="w-4 h-4" />
                                    使用
                                  </>
                                )}
                              </Button>
                            )}
                            
                            {/* 永久道具已拥有 - 显示切换按钮 */}
                            {owned ? (
                              <Button 
                                size="sm" 
                                variant={isActive(item.id) ? "default" : "outline"}
                                onClick={() => handleToggleActive(item.id)}
                                disabled={togglingId === item.id}
                                className={`h-9 w-full gap-1 ${isActive(item.id) ? 'bg-green-500 hover:bg-green-600' : 'border-gray-300'}`}
                              >
                                {togglingId === item.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : isActive(item.id) ? (
                                  <>
                                    <Check className="w-4 h-4" />
                                    使用中
                                  </>
                                ) : (
                                  '未使用'
                                )}
                              </Button>
                            ) : (
                              /* 购买按钮 */
                              <Button
                                size="sm"
                                onClick={() => handlePurchase(item.id)}
                                disabled={!affordable || purchasingId === item.id}
                                className="h-9 w-full gap-1"
                              >
                                {purchasingId === item.id ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    购买中
                                  </>
                                ) : (
                                  <>
                                    <ShoppingCart className="w-4 h-4" />
                                    购买
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
