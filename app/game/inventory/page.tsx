'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from "sonner"
import { ArrowLeft, Package, Sparkles, Trash2, ShoppingBag, Eye, AlertCircle, Plus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ClothCard } from '@/components/game/inventory/ClothCard'
import { ListingDialog } from '@/components/game/listings/ListingDialog'
import { ClothDetailDialog } from '@/components/game/inventory/ClothDetailDialog'
import { ExpansionDialog } from '@/components/game/inventory/ExpansionDialog'
import { usePlayerProfile } from '@/hooks/game/use-player-profile'
import { getSupabaseClient } from '@/lib/supabaseClient'
import { InventoryConfig } from '@/lib/game/config'

/**
 * 背包页面
 * 展示最近创作和背包作品
 */
export default function InventoryPage() {
  const { profile, refresh: refreshProfile } = usePlayerProfile()
  const [recentItems, setRecentItems] = useState<any[]>([])
  const [inventoryItems, setInventoryItems] = useState<any[]>([])
  const [capacity, setCapacity] = useState({ current: 0, max: 20 })
  const [loading, setLoading] = useState(true)
  
  // 上架相关状态
  const [listingDialogOpen, setListingDialogOpen] = useState(false)
  const [selectedCloth, setSelectedCloth] = useState<any | null>(null)
  
  // 查看详情相关状态
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [detailCloth, setDetailCloth] = useState<any | null>(null)
  const [detailSlotType, setDetailSlotType] = useState<'recent' | 'inventory'>('recent')

  // 扩容相关状态
  const [expansionDialogOpen, setExpansionDialogOpen] = useState(false)

  const [error, setError] = useState<string | null>(null)

  // 加载背包数据
  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      setError(null)
      
      // 获取 access token（使用单例客户端）
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setError('未登录')
        setLoading(false)
        return
      }
      
      const response = await fetch('/api/inventory', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      const result = await response.json()
      
      if (result.success) {
        setRecentItems(result.data.recent || [])
        setInventoryItems(result.data.inventory || [])
        setCapacity(result.data.capacity || { current: 0, max: 20, recentCount: 0, maxRecent: 5 })
      } else {
        setError(result.error?.userMessage || '加载背包失败')
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error)
      setError('网络错误，请检查网络连接')
    } finally {
      setLoading(false)
    }
  }

  // 保存到背包（乐观更新）
  const handleSaveToInventory = async (clothId: string) => {
    // 乐观更新：先在 UI 上移动
    const itemToMove = recentItems.find(item => item.cloth_id === clothId)
    if (itemToMove) {
      setRecentItems(prev => prev.filter(item => item.cloth_id !== clothId))
      setInventoryItems(prev => [...prev, { ...itemToMove, slot_type: 'inventory' }])
      setCapacity(prev => ({ ...prev, current: prev.current + 1 }))
    }

    try {
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        // 回滚乐观更新
        if (itemToMove) {
          setRecentItems(prev => [...prev, itemToMove])
          setInventoryItems(prev => prev.filter(item => item.cloth_id !== clothId))
          setCapacity(prev => ({ ...prev, current: prev.current - 1 }))
        }
        toast.error("请先登录", { position: "bottom-right", duration: 3000 })
        return
      }
      
      const response = await fetch('/api/inventory/save', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ cloth_id: clothId })
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success("作品已保存到背包", { position: "bottom-right", duration: 3000 })
      } else {
        // 回滚乐观更新
        if (itemToMove) {
          setRecentItems(prev => [...prev, itemToMove])
          setInventoryItems(prev => prev.filter(item => item.cloth_id !== clothId))
          setCapacity(prev => ({ ...prev, current: prev.current - 1 }))
        }
        toast.error(`保存失败: ${result.message || result.error || 'API调用失败'}`, { position: "bottom-right", duration: 5000 })
      }
    } catch (error) {
      // 回滚乐观更新
      if (itemToMove) {
        setRecentItems(prev => [...prev, itemToMove])
        setInventoryItems(prev => prev.filter(item => item.cloth_id !== clothId))
        setCapacity(prev => ({ ...prev, current: prev.current - 1 }))
      }
      console.error('保存到背包失败:', error)
      toast.error("保存失败: 网络错误", { position: "bottom-right", duration: 5000 })
    }
  }

  // 打开上架对话框
  const handleOpenListing = (item: any) => {
    setSelectedCloth(item.cloth)
    setListingDialogOpen(true)
  }

  // 上架成功后
  const handleListingSuccess = () => {
    // 刷新数据
    fetchInventory()
    // 显示成功提示
    toast.success("作品上架成功", {
      position: "bottom-right",
      duration: 3000
    })
  }

  // 查看作品详情
  const handleViewCloth = (item: any, slotType: 'recent' | 'inventory') => {
    setDetailCloth(item.cloth)
    setDetailSlotType(slotType)
    setDetailDialogOpen(true)
  }

  // 从详情对话框保存到背包
  const handleSaveFromDetail = () => {
    if (detailCloth) {
      handleSaveToInventory(detailCloth.id)
    }
  }

  // 从详情对话框打开上架
  const handleListFromDetail = () => {
    if (detailCloth) {
      setSelectedCloth(detailCloth)
      setDetailDialogOpen(false)
      setListingDialogOpen(true)
    }
  }

  // 背包扩容
  const handleExpandInventory = async () => {
    try {
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        toast.error("请先登录")
        return
      }

      const response = await fetch('/api/inventory/expand', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success(result.message)
        // 更新容量
        setCapacity(prev => ({
          ...prev,
          max: result.data.newMax
        }))
        // 刷新用户信息
        refreshProfile()
      } else {
        toast.error(result.error?.userMessage || '扩容失败')
      }
    } catch (err) {
      console.error('扩容失败:', err)
      toast.error("扩容失败: 网络错误")
    }
  }

  // 删除作品（乐观更新）
  const handleDeleteCloth = async (clothId: string) => {
    // 乐观更新：先从 UI 移除
    const itemToDelete = inventoryItems.find(item => item.cloth_id === clothId)
    if (itemToDelete) {
      setInventoryItems(prev => prev.filter(item => item.cloth_id !== clothId))
      setCapacity(prev => ({ ...prev, current: prev.current - 1 }))
    }

    try {
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        // 回滚
        if (itemToDelete) {
          setInventoryItems(prev => [...prev, itemToDelete])
          setCapacity(prev => ({ ...prev, current: prev.current + 1 }))
        }
        toast.error("请先登录")
        return
      }
      
      const response = await fetch(`/api/inventory?cloth_id=${clothId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success("作品已删除")
      } else {
        // 回滚
        if (itemToDelete) {
          setInventoryItems(prev => [...prev, itemToDelete])
          setCapacity(prev => ({ ...prev, current: prev.current + 1 }))
        }
        toast.error(`删除失败: ${result.message || '未知错误'}`)
      }
    } catch (err) {
      // 回滚
      if (itemToDelete) {
        setInventoryItems(prev => [...prev, itemToDelete])
        setCapacity(prev => ({ ...prev, current: prev.current + 1 }))
      }
      console.error('删除失败:', err)
      toast.error("删除失败: 网络错误")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-blue-50">
      
      {/* 顶部导航栏 */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
          
          {/* 左侧 */}
          <div className="flex items-center gap-4">
            <Link href="/game/shop">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <ArrowLeft className="w-4 h-4" />
                返回商店
              </Button>
            </Link>
            
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                🎒 我的背包
              </h1>
              {profile && (
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span>Lv.{profile.level}</span>
                  <span className="text-yellow-600 font-semibold">💰 {profile.currency} 币</span>
                </div>
              )}
            </div>
          </div>

          {/* 右侧：容量信息 */}
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">
              {capacity.current}/{capacity.max}
            </span>
          </div>
        </div>
      </motion.header>

      {/* 主内容 */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        
        {/* 最近创作区域 */}
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              最近创作
            </h2>
            <span className="text-sm text-gray-500">
              自动保留最新5个
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recentItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {recentItems.map((item) => (
                <ClothCard
                  key={item.id}
                  cloth={item.cloth}
                  showActions
                  onSave={() => handleSaveToInventory(item.cloth_id)}
                  onView={() => handleViewCloth(item, 'recent')}
                  badgeText="最近"
                  badgeColor="bg-yellow-500"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white/50 rounded-2xl border-2 border-dashed border-gray-300">
              <div className="text-4xl mb-3">🎨</div>
              <p className="text-gray-600">还没有创作作品</p>
              <p className="text-sm text-gray-500 mt-1">
                去创作工坊染制你的第一件作品吧！
              </p>
              <Link href="/game/workshop">
                <Button className="mt-4" variant="default">
                  去创作
                </Button>
              </Link>
            </div>
          )}
        </motion.section>

        {/* 背包作品区域 */}
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-500" />
              背包作品
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {capacity.current}/{capacity.max}
              </span>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-xs gap-1"
                onClick={() => setExpansionDialogOpen(true)}
              >
                <Plus className="w-3 h-3" />
                扩容
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : inventoryItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {inventoryItems.map((item) => (
                <ClothCard
                  key={item.id}
                  cloth={item.cloth}
                  showActions
                  onView={() => handleViewCloth(item, 'inventory')}
                  actionButtons={[
                    {
                      icon: <Eye className="w-4 h-4" />,
                      label: '查看',
                      variant: 'outline',
                      onClick: () => handleViewCloth(item, 'inventory')
                    },
                    {
                      icon: <ShoppingBag className="w-4 h-4" />,
                      label: '上架',
                      variant: 'default',
                      onClick: () => handleOpenListing(item)
                    },
                    {
                      icon: <Trash2 className="w-4 h-4" />,
                      label: '删除',
                      variant: 'destructive',
                      onClick: () => handleDeleteCloth(item.cloth_id)
                    }
                  ]}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white/50 rounded-2xl border-2 border-dashed border-gray-300">
              <div className="text-4xl mb-3">📦</div>
              <p className="text-gray-600">背包是空的</p>
              <p className="text-sm text-gray-500 mt-1">
                从"最近创作"保存作品到背包
              </p>
            </div>
          )}
        </motion.section>
      </main>

      {/* 错误提示 */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg z-50"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">加载失败</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="ml-auto -mt-1 -mr-2"
            >
              ✕
            </Button>
          </div>
        </motion.div>
      )}

      {/* 上架对话框 */}
      {selectedCloth && (
        <ListingDialog
          open={listingDialogOpen}
          onOpenChange={setListingDialogOpen}
          cloth={selectedCloth}
          onSuccess={handleListingSuccess}
        />
      )}

      {/* 作品详情对话框 */}
      <ClothDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        cloth={detailCloth}
        slotType={detailSlotType}
        onSave={handleSaveFromDetail}
        onList={handleListFromDetail}
      />

      {/* 背包扩容对话框 */}
      <ExpansionDialog
        open={expansionDialogOpen}
        onOpenChange={setExpansionDialogOpen}
        type="inventory"
        currentCapacity={capacity.current}
        maxCapacity={capacity.max}
        expansionCost={InventoryConfig.expansionCost}
        expansionAmount={InventoryConfig.expansionSlots}
        userCurrency={profile?.currency || 0}
        onConfirm={handleExpandInventory}
      />
    </div>
  )
}
