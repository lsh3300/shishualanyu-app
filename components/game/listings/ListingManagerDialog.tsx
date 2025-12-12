'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Star, StarOff, Edit2, X, Check } from 'lucide-react'
import { ClothPreview } from '@/components/game/preview/ClothPreview'
import { WithdrawConfirmDialog } from './WithdrawConfirmDialog'
import type { ClothLayer } from '@/types/game.types'

interface ListingItem {
  id: string
  price: number
  is_featured: boolean
  listed_at: string
  cloth?: {
    id: string
    layers?: ClothLayer[]
    score_data?: {
      grade: string
      total_score: number
    }
  }
}

interface ListingManagerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  listings: ListingItem[]
  onWithdraw: (listingId: string) => Promise<void>
  onUpdatePrice: (listingId: string, newPrice: number) => Promise<void>
  onSetFeatured: (listingId: string) => Promise<void>
  onRefresh: () => void
}

/**
 * 上架管理对话框
 */
export function ListingManagerDialog({
  open,
  onOpenChange,
  listings,
  onWithdraw,
  onUpdatePrice,
  onSetFeatured,
  onRefresh
}: ListingManagerDialogProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editPrice, setEditPrice] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [withdrawListing, setWithdrawListing] = useState<ListingItem | null>(null)

  const handleStartEdit = (listing: ListingItem) => {
    setEditingId(listing.id)
    setEditPrice(listing.price.toString())
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditPrice('')
  }

  const handleSavePrice = async (listingId: string) => {
    const price = parseInt(editPrice)
    if (isNaN(price) || price < 1 || price > 99999) {
      return
    }
    
    setLoadingId(listingId)
    try {
      await onUpdatePrice(listingId, price)
      setEditingId(null)
      setEditPrice('')
      onRefresh()
    } finally {
      setLoadingId(null)
    }
  }

  const handleSetFeatured = async (listingId: string) => {
    setLoadingId(listingId)
    try {
      await onSetFeatured(listingId)
      onRefresh()
    } finally {
      setLoadingId(null)
    }
  }

  const handleWithdrawConfirm = async () => {
    if (!withdrawListing) return
    await onWithdraw(withdrawListing.id)
    setWithdrawListing(null)
    onRefresh()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>管理上架作品</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            {listings.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-3">📦</div>
                <p>暂无上架作品</p>
              </div>
            ) : (
              <div className="space-y-3">
                {listings.map((listing) => (
                  <div
                    key={listing.id}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    {/* 作品预览 */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-300 flex-shrink-0">
                      <ClothPreview
                        layers={listing.cloth?.layers || []}
                        className="w-full h-full"
                      />
                    </div>

                    {/* 作品信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {listing.is_featured && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                            ⭐ 推荐
                          </span>
                        )}
                        {listing.cloth?.score_data && (
                          <span className="text-sm font-medium">
                            {listing.cloth.score_data.grade} · {listing.cloth.score_data.total_score}分
                          </span>
                        )}
                      </div>
                      
                      {/* 价格编辑 */}
                      <div className="flex items-center gap-2 mt-1">
                        {editingId === listing.id ? (
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="w-24 h-7 text-sm"
                              min={1}
                              max={99999}
                            />
                            <span className="text-sm text-gray-500">币</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0"
                              onClick={() => handleSavePrice(listing.id)}
                              disabled={loadingId === listing.id}
                            >
                              {loadingId === listing.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4 text-green-600" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0"
                              onClick={handleCancelEdit}
                            >
                              <X className="w-4 h-4 text-gray-500" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-green-600">
                              {listing.price} 币
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => handleStartEdit(listing)}
                            >
                              <Edit2 className="w-3 h-3 text-gray-500" />
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-400 mt-1">
                        上架于 {new Date(listing.listed_at).toLocaleDateString()}
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex flex-col gap-1">
                      <Button
                        size="sm"
                        variant={listing.is_featured ? 'secondary' : 'outline'}
                        className="text-xs h-7"
                        onClick={() => handleSetFeatured(listing.id)}
                        disabled={loadingId === listing.id}
                      >
                        {listing.is_featured ? (
                          <>
                            <StarOff className="w-3 h-3 mr-1" />
                            取消推荐
                          </>
                        ) : (
                          <>
                            <Star className="w-3 h-3 mr-1" />
                            设为推荐
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="text-xs h-7"
                        onClick={() => setWithdrawListing(listing)}
                      >
                        下架
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 下架确认对话框 */}
      <WithdrawConfirmDialog
        open={!!withdrawListing}
        onOpenChange={(open) => !open && setWithdrawListing(null)}
        listing={withdrawListing}
        onConfirm={handleWithdrawConfirm}
      />
    </>
  )
}
