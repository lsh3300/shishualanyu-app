'use client'

import { useState } from 'react'
import { Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export interface BatchAction {
  key: string
  label: string
  icon?: React.ReactNode
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost'
  confirmTitle?: string
  confirmMessage?: string
  requireConfirm?: boolean
}

export interface BatchActionsProps {
  selectedCount: number
  actions: BatchAction[]
  onAction: (actionKey: string) => Promise<void>
  onClearSelection: () => void
  className?: string
}

export function BatchActions({
  selectedCount,
  actions,
  onAction,
  onClearSelection,
  className = '',
}: BatchActionsProps) {
  const [confirmAction, setConfirmAction] = useState<BatchAction | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

  const executeAction = async (actionKey: string) => {
    setLoading(actionKey)
    try {
      await onAction(actionKey)
    } finally {
      setLoading(null)
      setConfirmAction(null)
    }
  }

  const handleAction = async (action: BatchAction) => {
    if (action.requireConfirm !== false && action.confirmMessage) {
      setConfirmAction(action)
      return
    }

    await executeAction(action.key)
  }

  if (selectedCount === 0) return null

  return (
    <>
      <div
        className={`rounded-[24px] border border-[#d9e8fb] bg-[linear-gradient(135deg,rgba(232,241,253,0.88)_0%,rgba(247,250,255,0.78)_100%)] p-4 shadow-[0_10px_24px_rgba(61,92,140,0.08)] ${className}`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-[#3a557b]">
              已选择 <span className="font-semibold text-[#223f69]">{selectedCount}</span> 项
            </span>
            <Button variant="ghost" size="sm" onClick={onClearSelection} className="h-8 w-8 rounded-full p-0 text-[#6e88b0]">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {actions.map((action) => (
              <Button
                key={action.key}
                variant={action.variant || 'outline'}
                size="sm"
                onClick={() => handleAction(action)}
                disabled={loading !== null}
                className="rounded-full"
              >
                {loading === action.key ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : action.icon ? (
                  <span className="mr-1">{action.icon}</span>
                ) : null}
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmAction?.confirmTitle || '确认操作'}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.confirmMessage?.replace('{count}', String(selectedCount)) ||
                `确定要对选中的 ${selectedCount} 项执行此操作吗？`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading !== null}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmAction && executeAction(confirmAction.key)}
              disabled={loading !== null}
              className={confirmAction?.variant === 'destructive' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  处理中...
                </>
              ) : (
                '确认'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default BatchActions
