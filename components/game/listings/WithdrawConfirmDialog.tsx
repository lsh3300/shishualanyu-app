'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, AlertTriangle } from 'lucide-react'
import { ClothPreview } from '@/components/game/preview/ClothPreview'
import type { ClothLayer } from '@/types/game.types'

interface WithdrawConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  listing: {
    id: string
    price: number
    cloth?: {
      id: string
      layers?: ClothLayer[]
      score_data?: {
        grade: string
        total_score: number
      }
    }
  } | null
  onConfirm: () => Promise<void>
}

/**
 * 下架确认对话框
 */
export function WithdrawConfirmDialog({
  open,
  onOpenChange,
  listing,
  onConfirm
}: WithdrawConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  if (!listing) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            确认下架
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 作品预览 */}
          <div className="flex justify-center">
            <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
              <ClothPreview
                layers={listing.cloth?.layers || []}
                className="w-full h-full"
              />
            </div>
          </div>

          {/* 作品信息 */}
          <div className="text-center space-y-1">
            {listing.cloth?.score_data && (
              <div className="text-sm text-gray-600">
                等级: <span className="font-bold">{listing.cloth.score_data.grade}</span>
                {' · '}
                评分: <span className="font-bold">{listing.cloth.score_data.total_score}</span>
              </div>
            )}
            <div className="text-sm text-gray-600">
              当前价格: <span className="font-bold text-green-600">{listing.price} 币</span>
            </div>
          </div>

          {/* 提示信息 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
            下架后，作品将返回到你的背包中，可以随时重新上架。
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            取消
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                下架中...
              </>
            ) : (
              '确认下架'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
