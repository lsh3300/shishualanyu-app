'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, TrendingUp, Package, Users, ArrowLeft, DollarSign, Calendar, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ShopScene } from '@/components/game/shop/ShopScene'
import { GameFunctionMenu } from '@/components/game/navigation/GameFunctionMenu'
import { ListingManagerDialog } from '@/components/game/listings/ListingManagerDialog'
import { TransactionHistoryDialog } from '@/components/game/transactions/TransactionHistoryDialog'
import { ItemShopDialog } from '@/components/game/items/ItemShopDialog'
import { ExpansionDialog } from '@/components/game/inventory/ExpansionDialog'
import { usePlayerProfile } from '@/hooks/game/use-player-profile'
import { getSupabaseClient } from '@/lib/supabaseClient'
import { ShopListing, Transaction, UserShop } from '@/types/shop.types'

/**
 * 我的商店页面 V2
 * 参考设计优化：商店作为主界面，背景占据主要空间
 */
export default function MyShopPageV2() {
  const { profile, refresh: refreshProfile } = usePlayerProfile()
  const [todayEarnings, setTodayEarnings] = useState(0)
  const [listedCount, setListedCount] = useState(0)
  const [todayVisitors, setTodayVisitors] = useState(0)
  const [listings, setListings] = useState<ShopListing[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [shopInfo, setShopInfo] = useState<UserShop | null>(null)
  const [pageLoading, setPageLoading] = useState(true)
  
  // 对话框状态
  const [listingManagerOpen, setListingManagerOpen] = useState(false)
  const [transactionHistoryOpen, setTransactionHistoryOpen] = useState(false)
  const [itemShopOpen, setItemShopOpen] = useState(false)
  const [expansionDialogOpen, setExpansionDialogOpen] = useState(false)
  const [expansionInfo, setExpansionInfo] = useState({ cost: 300, amount: 1 })

  // 加载商店数据
  useEffect(() => {
    fetchShopData()
  }, [profile])

  const fetchShopData = async () => {
    if (!profile?.user_id) return

    try {
      setPageLoading(true)

      // 获取 access token
      const { getSupabaseClient } = await import('@/lib/supabaseClient')
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        console.warn('未登录，跳过商店数据加载')
        setPageLoading(false)
        return
      }

      const headers = { 'Authorization': `Bearer ${session.access_token}` }

      // 并行获取商店信息和交易记录
      const [shopResponse, txResponse] = await Promise.all([
        fetch('/api/shop', { headers }),
        fetch('/api/transactions?type=sell&limit=20', { headers })
      ])

      const [shopResult, txResult] = await Promise.all([
        shopResponse.json(),
        txResponse.ok ? txResponse.json() : { success: false }
      ])
      
      if (shopResult.success) {
        setShopInfo(shopResult.data.shop)
        setListings(shopResult.data.listings || [])
        setListedCount(shopResult.data.listingCount || 0)
      }

      if (txResult.success) {
        setTransactions(txResult.data || [])
        
        // 计算今日收入
        const today = new Date().toISOString().split('T')[0]
        const todayEarningsCalc = (txResult.data || [])
          .filter((tx: Transaction) => tx.created_at.startsWith(today))
          .reduce((sum: number, tx: Transaction) => sum + tx.actual_price, 0)
        setTodayEarnings(todayEarningsCalc)
      }

      // 模拟访客数据
      setTodayVisitors(Math.floor(Math.random() * 50))

      // 获取扩容信息
      const expansionResponse = await fetch('/api/shop/expand-listings', { headers })
      if (expansionResponse.ok) {
        const expansionResult = await expansionResponse.json()
        if (expansionResult.success) {
          setExpansionInfo({
            cost: expansionResult.data.expansionCost || 300,
            amount: expansionResult.data.expansionAmount || 1
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch shop data:', error)
    } finally {
      setPageLoading(false)
    }
  }

  // 下架作品
  const handleWithdraw = async (listingId: string) => {
    try {
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch('/api/listings/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ listing_id: listingId })
      })

      const result = await response.json()
      if (result.success) {
        toast.success('下架成功')
        fetchShopData()
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
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch('/api/listings/price', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ listing_id: listingId, new_price: newPrice })
      })

      const result = await response.json()
      if (result.success) {
        toast.success('价格已更新')
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
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch('/api/listings/featured', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ listing_id: listingId })
      })

      const result = await response.json()
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.error?.userMessage || '操作失败')
      }
    } catch (error) {
      toast.error('操作失败')
    }
  }

  // 打开扩容对话框
  const handleOpenExpansion = async () => {
    setExpansionDialogOpen(true)
  }

  // 确认扩容
  const handleConfirmExpansion = async () => {
    try {
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch('/api/shop/expand-listings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const result = await response.json()
      if (result.success) {
        toast.success(result.message)
        fetchShopData()
        refreshProfile()
      } else {
        toast.error(result.error?.userMessage || '扩容失败')
      }
    } catch (error) {
      toast.error('扩容失败')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-sky-50 to-indigo-600">
      
      {/* 顶部导航栏 - 更紧凑 */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
          
          {/* 左侧：返回 + 商店名 */}
          <div className="flex items-center gap-4">
            <Link href="/game/hub">
              <Button variant="ghost" size="sm" className="gap-1.5 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">返回大厅</span>
              </Button>
            </Link>
            
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                🏪 {shopInfo?.shop_name || '我的蓝染坊'}
              </h1>
              {profile && (
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span>Lv.{profile.level} 染匠</span>
                  <span className="text-yellow-600 font-semibold">💰 {profile.currency} 币</span>
                </div>
              )}
            </div>
          </div>

          {/* 右侧：功能菜单 + 设置 */}
          <div className="flex items-center gap-2">
            <GameFunctionMenu />
            <Button variant="ghost" size="sm" className="gap-1.5">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">设置</span>
            </Button>
          </div>
        </div>
      </motion.header>

      {/* 主内容区域 */}
      <main className="max-w-7xl mx-auto px-4 py-4">
        
        {/* 统计卡片 - 紧凑横向布局 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative z-10 grid grid-cols-3 gap-3 mb-4"
        >
          {/* 今日收入 */}
          <StatCard
            icon={<TrendingUp className="w-4 h-4" />}
            label="今日收入"
            value={`${todayEarnings} 币`}
            change={`+${Math.floor(Math.random() * 10)}%`}
            color="green"
          />

          {/* 在售作品 */}
          <StatCard
            icon={<Package className="w-4 h-4" />}
            label="在售作品"
            value={`${listedCount} 件`}
            subtitle={`最多 ${shopInfo?.max_listing_slots || 5} 件`}
            color="blue"
          />

          {/* 今日访客 */}
          <StatCard
            icon={<Users className="w-4 h-4" />}
            label="今日访客"
            value={`${todayVisitors}`}
            subtitle="" // 移除静态文本
            color="purple"
          />
        </motion.div>

        {/* 商店场景 - 主视觉焦点 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative z-10"
        >
          <ShopScene listings={listings} />
        </motion.div>

        {/* 快捷操作栏 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative z-10 mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {/* 从背包上架 */}
          <Link href="/game/inventory">
            <Button 
              className="w-full h-14 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white flex items-center justify-center gap-2 shadow-lg"
              size="lg"
            >
              <Package className="w-5 h-5" />
              <span className="font-semibold text-sm">从背包上架</span>
            </Button>
          </Link>

          {/* 管理上架 */}
          <Button 
            className="w-full h-14 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white flex items-center justify-center gap-2 shadow-lg"
            size="lg"
            onClick={() => setListingManagerOpen(true)}
          >
            <Settings className="w-5 h-5" />
            <span className="font-semibold text-sm">管理上架</span>
          </Button>

          {/* 交易记录 */}
          <Button 
            className="w-full h-14 bg-gradient-to-br from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white flex items-center justify-center gap-2 shadow-lg"
            size="lg"
            onClick={() => setTransactionHistoryOpen(true)}
          >
            <DollarSign className="w-5 h-5" />
            <span className="font-semibold text-sm">交易记录</span>
          </Button>

          {/* 道具商城 */}
          <Button 
            className="w-full h-14 bg-gradient-to-br from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white flex items-center justify-center gap-2 shadow-lg"
            size="lg"
            onClick={() => setItemShopOpen(true)}
          >
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold text-sm">道具商城</span>
          </Button>
        </motion.div>

        {/* 扩容按钮（上架位满时显示） */}
        {listedCount >= (shopInfo?.max_listing_slots || 5) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-10 mt-3"
          >
            <Button
              variant="outline"
              className="w-full border-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50"
              onClick={handleOpenExpansion}
            >
              上架位已满，点击扩容 (+1位 / {expansionInfo.cost}币)
            </Button>
          </motion.div>
        )}

        {/* 调试按钮 - 添加测试货币 */}
        {process.env.NODE_ENV === 'development' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-10 mt-3"
          >
            <Button
              variant="outline"
              size="sm"
              className="text-xs text-gray-500 border-gray-300"
              onClick={async () => {
                try {
                  const supabase = getSupabaseClient()
                  const { data: { session } } = await supabase.auth.getSession()
                  if (!session) return
                  
                  const response = await fetch('/api/debug/add-currency', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${session.access_token}`
                    },
                    body: JSON.stringify({ 
                      currency: 1000,
                      items: ['golden_frame', 'silver_frame', 'lucky_dye', 'exp_potion']
                    })
                  })
                  const result = await response.json()
                  if (result.success) {
                    toast.success(result.message)
                    refreshProfile()
                  } else {
                    toast.error(result.error || '添加失败')
                  }
                } catch (error) {
                  toast.error('添加失败')
                }
              }}
            >
              🔧 调试: 添加1000币 + 测试道具
            </Button>
          </motion.div>
        )}

        {/* 最近交易记录 */}
        {transactions.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="relative z-10 mt-6 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-md"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              最近交易
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-gray-600">时间</th>
                    <th className="text-left py-2 text-gray-600">作品</th>
                    <th className="text-left py-2 text-gray-600">价格</th>
                    <th className="text-left py-2 text-gray-600">买家</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 5).map((tx) => (
                    <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2">{new Date(tx.created_at).toLocaleString()}</td>
                      <td className="py-2">作品 #{tx.cloth_id.substring(0, 6)}</td>
                      <td className="py-2 font-semibold text-green-600">{tx.actual_price} 币</td>
                      <td className="py-2">{tx.buyer_name || '系统'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </main>

      {/* 上架管理对话框 */}
      <ListingManagerDialog
        open={listingManagerOpen}
        onOpenChange={setListingManagerOpen}
        listings={listings}
        onWithdraw={handleWithdraw}
        onUpdatePrice={handleUpdatePrice}
        onSetFeatured={handleSetFeatured}
        onRefresh={fetchShopData}
      />

      {/* 交易记录对话框 */}
      <TransactionHistoryDialog
        open={transactionHistoryOpen}
        onOpenChange={setTransactionHistoryOpen}
      />

      {/* 道具商城对话框 */}
      <ItemShopDialog
        open={itemShopOpen}
        onOpenChange={setItemShopOpen}
        userCurrency={profile?.currency || 0}
        onPurchaseSuccess={refreshProfile}
      />

      {/* 上架位扩容对话框 */}
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
    </div>
  )
}

/**
 * 统计卡片组件 - 紧凑版
 */
interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string
  subtitle?: string
  change?: string
  color: 'green' | 'blue' | 'purple'
}

function StatCard({ icon, label, value, subtitle, change, color }: StatCardProps) {
  const colorClasses = {
    green: 'text-green-500 bg-green-50 border-green-200',
    blue: 'text-blue-500 bg-blue-50 border-blue-200',
    purple: 'text-purple-500 bg-purple-50 border-purple-200'
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-gray-600 font-medium">{label}</span>
        <div className={`p-1.5 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <div className="text-xl font-bold text-gray-800">
        {value}
      </div>
      {(subtitle || change) && (
        <div className="text-[10px] text-gray-500 mt-0.5">
          {change || subtitle}
        </div>
      )}
    </div>
  )
}
