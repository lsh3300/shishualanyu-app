'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Package, Sparkles, Trash2, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ClothCard } from '@/components/game/inventory/ClothCard'
import { ListingDialog } from '@/components/game/listings/ListingDialog'
import { usePlayerProfile } from '@/hooks/game/use-player-profile'

/**
 * 背包页面
 * 展示最近创作和背包作品
 */
export default function InventoryPage() {
  const { profile } = usePlayerProfile()
  const [recentItems, setRecentItems] = useState<any[]>([])
  const [inventoryItems, setInventoryItems] = useState<any[]>([])
  const [capacity, setCapacity] = useState({ current: 0, max: 20 })
  const [loading, setLoading] = useState(true)
  
  // 上架相关状态
  const [listingDialogOpen, setListingDialogOpen] = useState(false)
  const [selectedCloth, setSelectedCloth] = useState<any | null>(null)

  // 加载背包数据
  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/inventory')
      const result = await response.json()
      
      if (result.success) {
        setRecentItems(result.data.recent || [])
        setInventoryItems(result.data.inventory || [])
        setCapacity(result.data.capacity)
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  // 保存到背包
  const handleSaveToInventory = async (clothId: string) => {
    try {
      const response = await fetch('/api/inventory/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cloth_id: clothId })
      })

      const result = await response.json()
      
      if (result.success) {
        // 刷新数据
        fetchInventory()
      } else {
        alert(result.message || '保存失败')
      }
    } catch (error) {
      alert('保存失败，请稍后重试')
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
    // 可以显示成功提示
    alert('上架成功！')
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
              {capacity.current >= capacity.max && (
                <Button size="sm" variant="outline" className="text-xs">
                  扩容
                </Button>
              )}
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
                  actionButtons={[
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
                      onClick: () => console.log('删除', item.cloth_id)
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

      {/* 上架对话框 */}
      {selectedCloth && (
        <ListingDialog
          open={listingDialogOpen}
          onOpenChange={setListingDialogOpen}
          cloth={selectedCloth}
          onSuccess={handleListingSuccess}
        />
      )}
    </div>
  )
}
