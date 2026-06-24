'use client'

import { useState, useEffect } from 'react'
import { 
  Settings, TrendingUp, Package, Users, ArrowLeft, 
  DollarSign, Sparkles, Coins, BarChart3, Calendar, ShoppingBag
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ShopSceneFullscreen } from '@/components/game/shop/ShopSceneFullscreen'
import { ListingManagerDialog } from '@/components/game/listings/ListingManagerDialog'
import { TransactionHistoryDialog } from '@/components/game/transactions/TransactionHistoryDialog'
import { ItemShopDialog } from '@/components/game/items/ItemShopDialog'
import { ExpansionDialog } from '@/components/game/inventory/ExpansionDialog'
import { usePlayerProfile } from '@/hooks/game/use-player-profile'
import { useAuth } from '@/contexts/auth-context'
import { fetchJson } from '@/lib/fetch-json'
import { useShopData } from '@/hooks/game/use-shop-data'
import { useTransactions } from '@/hooks/game/use-transactions'
import type { ShopListing } from '@/types/shop.types'

/**
 * 我的商店页面
 * 全屏场景为主，操作栏悬浮叠加。
 */
export default function MyShopPage() {
  const { profile, loading: profileLoading, error: profileError, refresh: refreshProfile } = usePlayerProfile()
  const { user, loading: authLoading, getToken } = useAuth()
  const { data: shopData, mutate: mutateShop } = useShopData()
  const { transactions } = useTransactions({ type: 'sell', limit: 20, enabled: true })
  
  // 数据状态
  const [todayEarnings, setTodayEarnings] = useState(0)
  const [todayVisitors, setTodayVisitors] = useState(0)
  const [coinAnimation, setCoinAnimation] = useState(false)
  
  // 对话框状态
  const [listingManagerOpen, setListingManagerOpen] = useState(false)
  const [transactionHistoryOpen, setTransactionHistoryOpen] = useState(false)
  const [itemShopOpen, setItemShopOpen] = useState(false)
  const [expansionDialogOpen, setExpansionDialogOpen] = useState(false)
  const [statsDialogOpen, setStatsDialogOpen] = useState<'earnings' | 'listings' | 'visitors' | null>(null)

  const shopInfo = shopData?.shop ?? null
  const listings: ShopListing[] = shopData?.listings ?? []
  const listedCount = shopData?.listingCount ?? 0
  const expansionInfo = shopData?.expansion
    ? { cost: shopData.expansion.cost, amount: shopData.expansion.amount }
    : { cost: 300, amount: 1 }

  useEffect(() => {
    // 今日收益：从交易记录中计算
    const today = new Date().toISOString().split('T')[0]
    const todayEarningsCalc = (transactions || [])
      .filter((tx) => typeof tx.created_at === 'string' && tx.created_at.startsWith(today))
      .reduce((sum, tx) => sum + (typeof tx.actual_price === 'number' ? tx.actual_price : 0), 0)

    setTodayEarnings((prev) => {
      if (todayEarningsCalc > prev) {
        setCoinAnimation(true)
        setTimeout(() => setCoinAnimation(false), 1000)
      }
      return todayEarningsCalc
    })
  }, [transactions])

  useEffect(() => {
    setTodayVisitors(Math.floor(Math.random() * 50) + 10)
  }, [])

  // 未登录时显示登录提示
  if (!authLoading && !user) {
    return (
      <div className="page-container flex flex-col items-center justify-center p-4" style={{ fontFamily: "'Noto Serif SC', serif" }}>
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-indigo-100 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🏪</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">我的蓝染坊</h2>
          <p className="text-gray-600 mb-6">请先登录，再管理你的蓝染作品和店铺。</p>
          <div className="space-y-3">
            <Link href="/auth?view=login" className="block">
              <Button className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700">
                立即登录
              </Button>
            </Link>
            <Link href="/auth?view=register" className="block">
              <Button variant="outline" className="w-full">
                注册账号
              </Button>
            </Link>
            <Link href="/" className="block">
              <Button variant="ghost" className="w-full text-sm">
                返回首页
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // 如果用户已登录但档案加载失败，显示错误信息
  if (!authLoading && user && profileError) {
    return (
      <div className="page-container flex flex-col items-center justify-center p-4" style={{ fontFamily: "'Noto Serif SC', serif" }}>
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-red-100 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">加载档案失败</h2>
          <p className="text-red-600 mb-4 text-sm">{profileError}</p>
          <p className="text-gray-600 mb-6 text-sm">用户 ID: {user.id}</p>
          <div className="space-y-3">
            <Button 
              onClick={refreshProfile}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              重试加载
            </Button>
            <Link href="/" className="block">
              <Button variant="ghost" className="w-full text-sm">
                返回首页
              </Button>
            </Link>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-gray-50 rounded text-left">
              <p className="text-xs text-gray-600 mb-2">调试信息:</p>
              <p className="text-xs text-gray-500">认证状态: {authLoading ? '加载中' : '已完成'}</p>
              <p className="text-xs text-gray-500">用户: {user ? '已登录' : '未登录'}</p>
              <p className="text-xs text-gray-500">档案加载: {profileLoading ? '加载中' : '已完成'}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // 下架作品
  const handleWithdraw = async (listingId: string) => {
    try {
      const token = await getToken()
      if (!token) return

      const result = await fetchJson<{ success: boolean; message?: string; error?: { userMessage?: string } }>(
        '/api/listings/withdraw',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ listing_id: listingId }),
          timeoutMs: 12000,
          retries: 1,
        }
      )
      if (result.success) {
        toast.success('下架成功')
        void mutateShop()
      } else {
        toast.error(result.error?.userMessage || '下架失败')
      }
    } catch (error) {
      toast.error('下架失败')
    }
  }

  // 更新价格
  const handleUpdatePrice = async (listingId: string, newPrice: number) => {
    try {
      const token = await getToken()
      if (!token) return

      const result = await fetchJson<{ success: boolean; message?: string; error?: { userMessage?: string } }>(
        '/api/listings/price',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ listing_id: listingId, new_price: newPrice }),
          timeoutMs: 12000,
          retries: 1,
        }
      )
      if (result.success) {
        toast.success('价格已更新')
        void mutateShop()
      } else {
        toast.error(result.error?.userMessage || '更新失败')
      }
    } catch (error) {
      toast.error('更新失败')
    }
  }

  // 设置推荐
  const handleSetFeatured = async (listingId: string) => {
    try {
      const token = await getToken()
      if (!token) return

      const result = await fetchJson<{ success: boolean; message?: string; error?: { userMessage?: string } }>(
        '/api/listings/featured',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ listing_id: listingId }),
          timeoutMs: 12000,
          retries: 1,
        }
      )
      if (result.success) {
        toast.success(result.message)
        void mutateShop()
      } else {
        toast.error(result.error?.userMessage || '操作失败')
      }
    } catch (error) {
      toast.error('操作失败')
    }
  }

  // 确认扩容
  const handleConfirmExpansion = async () => {
    try {
      const token = await getToken()
      if (!token) return

      const result = await fetchJson<{ success: boolean; message?: string; error?: { userMessage?: string } }>(
        '/api/shop/expand-listings',
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          timeoutMs: 12000,
          retries: 1,
        }
      )
      if (result.success) {
        toast.success(result.message)
        void mutateShop()
        refreshProfile()
      } else {
        toast.error(result.error?.userMessage || '扩容失败')
      }
    } catch (error) {
      toast.error('扩容失败')
    }
  }

  // 画框点击处理
  const handleFrameClick = (index: number, listing?: ShopListing) => {
    if (!listing) {
      // 空画框直接跳转到背包上架
      window.location.href = '/game/inventory'
    }
  }

  // 快捷操作处理
  const handleQuickAction = async (action: 'edit' | 'delete' | 'feature' | 'share', listing: ShopListing) => {
    switch (action) {
      case 'edit':
        // 触发价格编辑
        const newPrice = prompt(`修改价格（当前：${listing.price} 币）`, listing.price.toString())
        if (newPrice && !isNaN(Number(newPrice))) {
          await handleUpdatePrice(listing.id, Number(newPrice))
        }
        break
      case 'delete':
        if (confirm('确定要下架这件作品吗？')) {
          await handleWithdraw(listing.id)
        }
        break
      case 'feature':
        await handleSetFeatured(listing.id)
        break
      case 'share':
        // 分享功能
        if (navigator.share) {
          navigator.share({
            title: '我的蓝染作品',
            text: `看看我的 ${listing.cloth?.score_data?.grade || 'C'} 级作品吧！`,
            url: window.location.href
          })
        } else {
          // 复制链接到剪贴板
          navigator.clipboard.writeText(window.location.href)
          toast.success('链接已复制到剪贴板')
        }
        break
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-100 flex flex-col relative" style={{ fontFamily: "'Noto Serif SC', serif" }}>
      {/* 装饰背景 */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 decorative-pattern paper-texture"></div>
      </div>

      {/* 紧凑顶部栏 */}
      <header className="relative z-10 flex-shrink-0 border-b border-amber-700/30 bg-gradient-to-b from-amber-900/90 to-amber-800/80 px-4 py-2 shadow-lg backdrop-blur-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          {/* 左侧：返回 + 店铺名 */}
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Link href="/">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-8 h-8 p-0 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 active:scale-95 border border-white/20"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-bold text-white drop-shadow-sm">
                🏪 {shopInfo?.shop_name || '我的蓝染坊'}
              </h1>
              {profile && (
                <p className="text-[10px] text-amber-100">Lv.{profile.level} 染匠</p>
              )}
            </div>
          </div>

          {/* 右侧：大厅按钮 + 货币显示 */}
          <div className="flex w-full items-center justify-between gap-2 min-[440px]:w-auto min-[440px]:justify-end">
            <Link href="/game/hub">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 border-2 border-blue-200 bg-white/90 shadow-md backdrop-blur-sm hover:bg-white"
              >
                <span className="text-lg">🏠</span>
                大厅
              </Button>
            </Link>
            <div className={`flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-yellow-500 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg border border-yellow-300 transition-all duration-300 ${coinAnimation ? 'scale-110 shadow-yellow-400/50' : ''}`}>
              <Coins className={`w-4 h-4 text-yellow-900 ${coinAnimation ? 'animate-bounce' : ''}`} />
              <span className={`text-sm font-bold text-yellow-900 ${coinAnimation ? 'animate-pulse' : ''}`}>{profile?.currency || 0}</span>
            </div>
          </div>
        </div>
      </header>

      {/* 游戏场景区域 */}
      <div className="flex-1 relative overflow-hidden">
        <ShopSceneFullscreen 
          listings={listings}
          onFrameClick={handleFrameClick}
          onQuickAction={handleQuickAction}
        />
      </div>

      {/* 底部操作区 */}
      <div className="flex-shrink-0 bg-gradient-to-t from-amber-900/95 to-amber-800/90 backdrop-blur-sm px-4 pb-4 pt-2 border-t border-amber-700/30 shadow-lg relative z-10">
        {/* 统计信息栏 */}
        <div className="flex items-center justify-center gap-4 mb-3 py-2 rounded-xl enhanced-glass border border-white/20 shadow-inner">
          <button
            onClick={() => setStatsDialogOpen('earnings')}
            className="flex items-center gap-1.5 text-xs text-white hover:text-yellow-200 transition-colors active:scale-95"
          >
            <TrendingUp className="w-3.5 h-3.5 text-green-300" />
            <span className="font-medium">今日 +{todayEarnings}</span>
          </button>
          <div className="w-px h-4 bg-white/30" />
          <button
            onClick={() => setStatsDialogOpen('listings')}
            className="flex items-center gap-1.5 text-xs text-white hover:text-blue-200 transition-colors active:scale-95"
          >
            <Package className="w-3.5 h-3.5 text-blue-300" />
            <span className="font-medium">{listedCount}/{shopInfo?.max_listing_slots || 5} 在售</span>
          </button>
          <div className="w-px h-4 bg-white/30" />
          <button
            onClick={() => setStatsDialogOpen('visitors')}
            className="flex items-center gap-1.5 text-xs text-white hover:text-purple-200 transition-colors active:scale-95"
          >
            <Users className="w-3.5 h-3.5 text-purple-300" />
            <span className="font-medium">{todayVisitors} 访客</span>
          </button>
        </div>

        {/* 主要操作按钮 */}
        <div className="grid grid-cols-2 gap-3 mb-2">
          <Link href="/game/inventory" className="block">
            <button className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl metallic-button text-white shadow-lg active:scale-95 transition-transform">
              <Package className="w-6 h-6" />
              <span className="font-bold">从背包上架</span>
            </button>
          </Link>
          <button 
            onClick={() => setListingManagerOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg active:scale-95 transition-transform"
          >
            <Settings className="w-6 h-6" />
            <span className="font-bold">管理上架</span>
          </button>
        </div>

        {/* 次要操作按钮 */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => setTransactionHistoryOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-md active:scale-95 transition-transform"
          >
            <DollarSign className="w-5 h-5" />
            <span className="font-medium text-sm">交易记录</span>
          </button>
          <button 
            onClick={() => setItemShopOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 text-white shadow-md active:scale-95 transition-transform"
          >
            <Sparkles className="w-5 h-5" />
            <span className="font-medium text-sm">道具商城</span>
          </button>
        </div>

        {/* 扩容提示 */}
        {listedCount >= (shopInfo?.max_listing_slots || 5) && (
          <button
            onClick={() => setExpansionDialogOpen(true)}
            className="w-full mt-3 py-2 border-2 border-dashed border-yellow-400/50 text-yellow-400 rounded-xl text-sm font-medium active:scale-95 transition-transform"
          >
            上架位已满，点击扩容（+{expansionInfo.amount} 位 / {expansionInfo.cost} 币）
          </button>
        )}
      </div>

      {/* 对话框 */}
      <ListingManagerDialog
        open={listingManagerOpen}
        onOpenChange={setListingManagerOpen}
        listings={listings}
        onWithdraw={handleWithdraw}
        onUpdatePrice={handleUpdatePrice}
        onSetFeatured={handleSetFeatured}
        onRefresh={() => void mutateShop()}
      />

      <TransactionHistoryDialog
        open={transactionHistoryOpen}
        onOpenChange={setTransactionHistoryOpen}
      />

      <ItemShopDialog
        open={itemShopOpen}
        onOpenChange={setItemShopOpen}
        userCurrency={profile?.currency || 0}
        onPurchaseSuccess={refreshProfile}
      />

      <ExpansionDialog
        open={expansionDialogOpen}
        onOpenChange={setExpansionDialogOpen}
        type="listing"
        currentCapacity={listedCount}
        maxCapacity={shopInfo?.max_listing_slots || 5}
        expansionCost={expansionInfo.cost}
        expansionAmount={expansionInfo.amount}
        userCurrency={profile?.currency || 0}
        onConfirm={handleConfirmExpansion}
      />

      {/* 统计详情弹窗 */}
      <StatsDialog
        open={statsDialogOpen}
        onOpenChange={setStatsDialogOpen}
        todayEarnings={todayEarnings}
        listedCount={listedCount}
        maxSlots={shopInfo?.max_listing_slots || 5}
        todayVisitors={todayVisitors}
        listings={listings}
      />
    </div>
  )
}

/**
 * 手机端游戏商店优化版
 * - 顶部信息固定
 * - 场景区域优先
 * - 底部操作更适合触屏点击
 * - 统计信息紧凑展示
 */

/**
 * 统计详情弹窗组件
 */
interface StatsDialogProps {
  open: 'earnings' | 'listings' | 'visitors' | null
  onOpenChange: (open: 'earnings' | 'listings' | 'visitors' | null) => void
  todayEarnings: number
  listedCount: number
  maxSlots: number
  todayVisitors: number
  listings: ShopListing[]
}

function StatsDialog({ 
  open, 
  onOpenChange, 
  todayEarnings, 
  listedCount, 
  maxSlots, 
  todayVisitors, 
  listings 
}: StatsDialogProps) {
  if (!open) return null

  const handleClose = () => onOpenChange(null)

  const renderContent = () => {
    switch (open) {
      case 'earnings':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">+{todayEarnings}</div>
                <div className="text-sm text-gray-600">今日收入</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 text-center">
                <BarChart3 className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-green-700">{Math.floor(todayEarnings / Math.max(listedCount, 1))}</div>
                <div className="text-xs text-green-600">平均单价</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 text-center">
                <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-blue-700">{todayEarnings * 7}</div>
                <div className="text-xs text-blue-600">预计周收益</div>
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl p-4">
              <div className="text-sm font-medium text-amber-800 mb-2">收入提升建议</div>
              <div className="text-xs text-amber-700 space-y-1">
                <div>尝试微调作品价格，找到更合适的定价点。</div>
                <div>将高评分作品设为推荐，提升曝光机会。</div>
                <div>定期更新商品，保持店铺活跃度。</div>
              </div>
            </div>
          </div>
        )

      case 'listings':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{listedCount}/{maxSlots}</div>
              <div className="text-sm text-gray-600">商品上架情况</div>
            </div>

            <div className="space-y-3">
              {listings.map((listing, index) => (
                <div key={listing.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0">
                    {listing.cloth?.layers && Array.isArray(listing.cloth.layers) && listing.cloth.layers.length > 0 ? (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-xs">布</span>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-xs">布</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`
                        px-2 py-0.5 rounded text-[10px] font-bold text-white
                        ${listing.cloth?.score_data?.grade === 'SSS' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                          listing.cloth?.score_data?.grade === 'SS' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                          listing.cloth?.score_data?.grade === 'S' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                          listing.cloth?.score_data?.grade === 'A' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                          'bg-gray-400'}
                      `}>
                        {listing.cloth?.score_data?.grade || 'C'}
                      </div>
                      <div className="text-sm font-bold text-green-600">{listing.price} 币</div>
                    </div>
                    <div className="text-xs text-gray-500">位置 {index + 1}</div>
                  </div>
                </div>
              ))}
              
              {listedCount < maxSlots && (
                <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-xl">
                  <ShoppingBag className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <div className="text-sm text-gray-500">还有 {maxSlots - listedCount} 个空位</div>
                  <div className="text-xs text-gray-400">点击上方按钮继续上架更多作品</div>
                </div>
              )}
            </div>
          </div>
        )

      case 'visitors':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{todayVisitors}</div>
               <div className="text-sm text-gray-600">今日访客</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 text-center">
                <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-purple-700">{Math.floor(todayVisitors * 0.15)}</div>
                <div className="text-xs text-purple-600">潜在买家</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 text-center">
                <TrendingUp className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-orange-700">{Math.floor((todayEarnings / Math.max(todayVisitors, 1)) * 100)}%</div>
                <div className="text-xs text-orange-600">转化率</div>
              </div>
            </div>

            <div className="bg-indigo-50 rounded-xl p-4">
              <div className="text-sm font-medium text-indigo-800 mb-2">访客分析</div>
              <div className="text-xs text-indigo-700 space-y-1">
                <div>访客主要来自推荐页与搜索入口。</div>
                <div>高评分作品通常更容易获得关注。</div>
                <div>合理定价能提升购买转化率。</div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const getTitle = () => {
    switch (open) {
      case 'earnings': return '收入详情'
      case 'listings': return '商品管理'
      case 'visitors': return '访客统计'
      default: return ''
    }
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-[calc(100%-2rem)] sm:max-w-sm w-full max-h-[80vh] overflow-hidden my-4">
        <div className="sticky top-0 bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">{getTitle()}</h2>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <span className="text-white text-lg">×</span>
            </button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

