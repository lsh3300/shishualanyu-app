'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ClothPreview } from '@/components/game/preview/ClothPreview'
import { ShoppingBag, TrendingUp, AlertCircle } from 'lucide-react'
import type { ClothLayer } from '@/types/game.types'

interface ListingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cloth: {
    id: string
    cloth_data: {
      layers: ClothLayer[]
    }
    score_data?: {
      total_score: number
      grade: string
    }
  }
  onSuccess?: () => void
}

/**
 * 上架对话框
 * 展示作品预览、建议价格、允许自定义价格
 */
export function ListingDialog({
  open,
  onOpenChange,
  cloth,
  onSuccess
}: ListingDialogProps) {
  const [customPrice, setCustomPrice] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 计算建议价格
  const calculateSuggestedPrice = () => {
    if (!cloth.score_data) return 100

    const basePrice = 100
    const gradeMultipliers: Record<string, number> = {
      'SSS': 3.0,
      'SS': 2.5,
      'S': 2.0,
      'A': 1.5,
      'B': 1.0,
      'C': 0.5
    }

    const multiplier = gradeMultipliers[cloth.score_data.grade] || 1.0
    const price = Math.round(basePrice * multiplier)
    const scoreBonus = Math.floor(cloth.score_data.total_score / 10) * 10

    return price + scoreBonus
  }

  const suggestedPrice = calculateSuggestedPrice()

  // 等级颜色
  const gradeColors: Record<string, string> = {
    'SSS': 'text-purple-600',
    'SS': 'text-blue-600',
    'S': 'text-green-600',
    'A': 'text-yellow-600',
    'B': 'text-gray-600',
    'C': 'text-gray-400'
  }

  const grade = cloth.score_data?.grade || 'C'
  const gradeColor = gradeColors[grade]

  // 处理上架
  const handleList = async () => {
    setLoading(true)
    setError(null)

    try {
      const price = customPrice ? parseInt(customPrice) : suggestedPrice

      if (isNaN(price) || price < 10) {
        setError('价格必须大于等于10币')
        setLoading(false)
        return
      }

      if (price > 9999) {
        setError('价格不能超过9999币')
        setLoading(false)
        return
      }

      // 获取 access token
      const { getSupabaseClient } = await import('@/lib/supabaseClient')
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setError('请先登录')
        setLoading(false)
        return
      }

      const response = await fetch('/api/listings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          cloth_id: cloth.id,
          price: price,
          score_data: cloth.score_data
        })
      })

      const result = await response.json()
      console.log('📦 上架API响应:', result)

      if (!response.ok || !result.success) {
        const errorMsg = result.error?.userMessage || result.error?.message || result.error || result.message || '上架失败'
        console.error('❌ 上架失败:', errorMsg)
        setError(errorMsg)
        return
      }

      // 成功
      onSuccess?.()
      onOpenChange(false)
    } catch (err) {
      console.error('上架失败:', err)
      setError('上架失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-500" />
            上架到商店
          </DialogTitle>
          <DialogDescription>
            设置价格后，其他玩家即可购买你的作品
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 作品预览 */}
          <div className="flex justify-center">
            <div className="w-48 h-48 rounded-xl overflow-hidden shadow-lg border-4 border-amber-900">
              <ClothPreview
                layers={cloth.cloth_data?.layers || []}
                showFrame={false}
              />
            </div>
          </div>

          {/* 作品信息 */}
          {cloth.score_data && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">作品评分</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xl font-bold ${gradeColor}`}>
                    {cloth.score_data.grade}
                  </span>
                  <span className="text-sm text-gray-500">
                    {cloth.score_data.total_score}分
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 价格设置 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">建议价格</Label>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-lg font-bold text-green-600">
                  {suggestedPrice} 币
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-price" className="text-sm">
                自定义价格（可选）
              </Label>
              <Input
                id="custom-price"
                type="number"
                placeholder={`留空使用建议价格（${suggestedPrice}币）`}
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                min={10}
                max={9999}
              />
              <p className="text-xs text-gray-500">
                价格范围：10-9999币
              </p>
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* 提示信息 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              💡 <strong>提示：</strong>
              高评分作品会获得更高的建议价格。你可以根据市场行情调整价格。
            </p>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="flex-1"
          >
            取消
          </Button>
          <Button
            onClick={handleList}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
          >
            {loading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                上架中...
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 mr-2" />
                确认上架
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
