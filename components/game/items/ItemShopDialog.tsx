'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, ShoppingCart, Check, Sparkles, Zap, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { getSupabaseClient } from '@/lib/supabaseClient'
import type { ShopItem } from '@/types/items.types'

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
  const [items, setItems] = useState<ShopItem[]>([])
  const [userItems, setUserItems] = useState<Record<string, number>>({})
  const [activeItems, setActiveItems] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [purchasingId, setPurchasingId] = useState<string | null>(null)
  const [usingId, setUsingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)

  const tokenRef = useRef<string | null>(null)

  // 获取并缓存 access token
  useEffect(() => {
    const getToken = async () => {
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        tokenRef.current = session.access_token
        setAccessToken(session.access_token)
      }
    }
    getToken()
  }, [])

  const fetchItems = useCallback(async () => {
    const token = tokenRef.current
    if (!token) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/items', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const result = await response.json()
      console.log('道具商城数据:', result) // 调试日志
      if (result.success) {
        setItems(result.data.items || [])
        setUserItems(result.data.userItems || {})
        setActiveItems(result.data.activeItems || {})
      } else {
        console.error('获取道具失败:', result.error)
      }
    } catch (error) {
      console.error('获取道具列表失败:', error)
      toast.error('加载失败，请重试')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open && accessToken) {
      fetchItems()
    }
  }, [open, accessToken, fetchItems])

  const handlePurchase = async (itemId: string) => {
    if (!accessToken) {
      toast.error('请先登录')
      return
    }

    setPurchasingId(itemId)
    try {
      const response = await fetch('/api/items/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ item_id: itemId, quantity: 1 })
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success(result.message)
        await fetchItems()
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
    if (!accessToken) {
      toast.error('请先登录')
      return
    }

    setUsingId(itemId)
    try {
      const response = await fetch('/api/items/use', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ item_id: itemId, quantity: 1 })
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success(result.message)
        await fetchItems()
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
    if (!accessToken) {
      toast.error('请先登录')
      return
    }

    setTogglingId(itemId)
    try {
      const response = await fetch('/api/items/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ item_id: itemId })
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success(result.message)
        setActiveItems(prev => ({
          ...prev,
          [itemId]: result.data.is_active
        }))
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
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
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
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchItems}
            disabled={loading}
            className="gap-1 text-gray-500"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
          <div className="px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    <div className="flex items-start gap-3">
                      {/* 图标 */}
                      <div className="text-3xl">{item.icon}</div>

                      {/* 信息 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium text-gray-800">{item.name}</h3>
                          {item.type === 'permanent' && (
                            <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                              永久
                            </span>
                          )}
                          {owned && (
                            <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              已拥有
                            </span>
                          )}
                          {quantity > 0 && item.type === 'consumable' && (
                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                              持有: {quantity}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                        
                        {/* 价格和操作按钮 */}
                        <div className="flex items-center justify-between mt-3 gap-2">
                          <span className="font-bold text-yellow-600">💰 {item.price} 币</span>
                          
                          <div className="flex gap-2">
                            {/* 使用按钮 - 消耗品有库存时显示 */}
                            {item.type === 'consumable' && quantity > 0 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUse(item.id)}
                                disabled={usingId === item.id}
                                className="gap-1 border-green-300 text-green-700 hover:bg-green-50"
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
                                className={`gap-1 ${isActive(item.id) ? 'bg-green-500 hover:bg-green-600' : 'border-gray-300'}`}
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
                                className="gap-1"
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
