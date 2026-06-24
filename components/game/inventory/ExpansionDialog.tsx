'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, Package, ShoppingBag, AlertCircle } from 'lucide-react'

interface ExpansionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: 'inventory' | 'listing'
  currentCapacity: number
  maxCapacity: number
  expansionCost: number
  expansionAmount: number
  userCurrency: number
  onConfirm: () => Promise<void>
}

/**
 * 扩容对话框
 * 用于背包扩容和上架位扩容
 */
export function ExpansionDialog({
  open,
  onOpenChange,
  type,
  currentCapacity,
  maxCapacity,
  expansionCost,
  expansionAmount,
  userCurrency,
  onConfirm
}: ExpansionDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const isInventory = type === 'inventory'
  const title = isInventory ? '背包扩容' : '上架位扩容'
  const icon = isInventory ? <Package className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />
  const unit = isInventory ? '格' : '个'
  
  const canAfford = userCurrency >= expansionCost

  const handleConfirm = async () => {
    if (!canAfford) return
    
    setIsLoading(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {icon}
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 当前状态 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">当前容量</span>
              <span className="font-medium">{currentCapacity} / {maxCapacity} {unit}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${(currentCapacity / maxCapacity) * 100}%` }}
              />
            </div>
          </div>

          {/* 扩容信息 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-blue-700">扩容后容量</span>
              <span className="font-bold text-blue-700">
                {maxCapacity} → {maxCapacity + expansionAmount} {unit}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-700">增加</span>
              <span className="font-medium text-blue-700">+{expansionAmount} {unit}</span>
            </div>
          </div>

          {/* 价格信息 */}
          <div className="flex justify-between items-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <span className="text-sm font-medium text-yellow-800">扩容费用</span>
            <span className="text-xl font-bold text-yellow-700">💰 {expansionCost} 币</span>
          </div>

          {/* 货币余额 */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">当前余额</span>
            <span className={`font-medium ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
              💰 {userCurrency} 币
            </span>
          </div>

          {/* 货币不足提示 */}
          {!canAfford && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>货币不足，还需要 {expansionCost - userCurrency} 币</span>
            </div>
          )}
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
            onClick={handleConfirm}
            disabled={isLoading || !canAfford}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                扩容中...
              </>
            ) : (
              `确认扩容 (${expansionCost} 币)`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
