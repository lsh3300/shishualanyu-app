'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Store, ShoppingCart, Star, Loader2, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { GameFunctionMenu } from '@/components/game/navigation/GameFunctionMenu'
import { usePlayerProfile } from '@/hooks/game/use-player-profile'
import { getSupabaseClient } from '@/lib/supabaseClient'

interface MarketListing {
  id: string
  shop_id: string
  seller_id: string
  seller_name: string
  cloth_data: {
    id: string
    name: string
    pattern: string
    colors: string[]
    technique: string
    score: number
    grade: string
    preview_url?: string
  }
  price: number
  original_price: number
  is_featured: boolean
  status: string
  created_at: string
  is_system?: boolean
}

/**
 * 市场页面 - 浏览和购买其他商店的作品
 */
export default function MarketPage() {
  const { profile, refresh: refreshProfile } = usePlayerProfile()
  const [listings, setListings] = useState<MarketListing[]>([])
  const [loading, setLoading] = useState(true)
  const [purchasingId, setPurchasingId] = useState<string | null>(null)

  useEffect(() => {
    fetchMarketData()
  }, [])

  const fetchMarketData = async () => {
    setLoading(true)
    try {
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        toast.error('请先登录')
        return
      }

      const response = await fetch('/api/market', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const result = await response.json()
      if (result.success) {
        setListings(result.data.listings || [])
      } else {
        toast.error('加载市场数据失败')
      }
    } catch (error) {
      console.error('获取市场数据失败:', error)
      toast.error('加载失败')
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (listing: MarketListing) => {
    if (!profile) {
      toast.error('请先登录')
      return
    }

    if (profile.currency < listing.price) {
      toast.error(`货币不足，需要 ${listing.price} 币`)
      return
    }

    setPurchasingId(listing.id)
    try {
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) return

      const response = await fetch('/api/market/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ listing_id: listing.id })
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success(result.message)
        refreshProfile()
        // 如果不是系统商店的作品，从列表中移除
        if (!listing.id.startsWith('system-listing-')) {
          setListings(prev => prev.filter(l => l.id !== listing.id))
        }
      } else {
        toast.error(result.error?.userMessage || '购买失败')
      }
    } catch (error) {
      console.error('购买失败:', error)
      toast.error('购买失败')
    } finally {
      setPurchasingId(null)
    }
  }

  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      'SSS': 'text-yellow-500 bg-yellow-50',
      'SS': 'text-orange-500 bg-orange-50',
      'S': 'text-purple-500 bg-purple-50',
      'A': 'text-blue-500 bg-blue-50',
      'B': 'text-green-500 bg-green-50',
      'C': 'text-gray-500 bg-gray-50'
    }
    return colors[grade] || 'text-gray-500 bg-gray-50'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-sky-50 to-indigo-100">
      {/* 顶部导航栏 */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-1.5 text-gray-600 hover:text-gray-900">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">主页</span>
              </Button>
            </Link>
            <Link href="/game/hub">
              <Button variant="ghost" size="sm" className="gap-1.5 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">大厅</span>
              </Button>
            </Link>
            
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                🏪 蓝染市场
              </h1>
              {profile && (
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span>Lv.{profile.level} 染匠</span>
                  <span className="text-yellow-600 font-semibold">💰 {profile.currency} 币</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchMarketData}
              disabled={loading}
              className="gap-1"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
            <GameFunctionMenu />
          </div>
        </div>
      </motion.header>

      {/* 主内容区域 */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20">
            <Store className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">暂无上架作品</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {listings.map((listing) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-xl shadow-md overflow-hidden border-2 ${
                  listing.is_featured ? 'border-yellow-400' : 'border-transparent'
                }`}
              >
                {/* 作品预览 */}
                <div 
                  className="h-40 relative"
                  style={{
                    background: listing.cloth_data.colors 
                      ? `linear-gradient(135deg, ${listing.cloth_data.colors.join(', ')})`
                      : '#e5e7eb'
                  }}
                >
                  {listing.is_featured && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      推荐
                    </div>
                  )}
                  {listing.id.startsWith('system-') && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                      官方
                    </div>
                  )}
                  <div className={`absolute bottom-2 right-2 px-2 py-1 rounded-full text-xs font-bold ${getGradeColor(listing.cloth_data.grade)}`}>
                    {listing.cloth_data.grade}
                  </div>
                </div>

                {/* 作品信息 */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 truncate">{listing.cloth_data.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{listing.seller_name}</p>
                  
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-bold text-yellow-600 text-lg">💰 {listing.price}</span>
                    
                    <Button
                      size="sm"
                      onClick={() => handlePurchase(listing)}
                      disabled={
                        purchasingId === listing.id || 
                        (profile?.currency || 0) < listing.price
                      }
                      className="gap-1"
                    >
                      {purchasingId === listing.id ? (
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
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
