'use client'

import { Loader2, RefreshCw, AlertCircle } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'
import { getErrorMessage } from './error-state'

interface LoadingStateFooterProps {
  /** 是否正在加载 */
  loading: boolean
  /** 是否还有更多 */
  hasMore: boolean
  /** 错误信息 */
  error?: Error | null
  /** 重试回调 */
  onRetry?: () => void
  /** 自定义加载中文本 */
  loadingText?: string
  /** 自定义无更多数据文本 */
  noMoreText?: string
  /** 自定义错误文本 */
  errorText?: string
  /** 自定义类名 */
  className?: string
}

/**
 * 统一加载状态底部组件
 * 用于懒加载列表底部显示加载状态
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */
export function LoadingStateFooter({
  loading,
  hasMore,
  error,
  onRetry,
  loadingText = '加载中...',
  noMoreText = '没有更多了',
  errorText = '加载失败，请重试',
  className,
}: LoadingStateFooterProps) {
  // 错误状态 - 带重试按钮 (Requirement 3.4)
  // 使用智能错误消息映射 (Requirement 7.5)
  if (error) {
    const displayErrorText = errorText || getErrorMessage(error)
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center py-6 px-4 gap-3',
          className
        )}
        role="alert"
        aria-live="polite"
      >
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="w-5 h-5" aria-hidden="true" />
          <span className="text-sm font-medium">{displayErrorText}</span>
        </div>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="gap-2"
            aria-label="重试加载"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            重试
          </Button>
        )}
      </div>
    )
  }

  // 加载中状态 - spinner 动画 (Requirement 3.1)
  if (loading) {
    return (
      <div
        className={cn(
          'flex items-center justify-center py-6 px-4 gap-2',
          className
        )}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <Loader2 
          className="w-5 h-5 animate-spin text-primary" 
          aria-hidden="true" 
        />
        <span className="text-sm text-muted-foreground">{loadingText}</span>
        <span className="sr-only">正在加载更多内容</span>
      </div>
    )
  }

  // 还有更多数据状态 (Requirement 3.2)
  if (hasMore) {
    return (
      <div
        className={cn(
          'flex items-center justify-center py-6 px-4',
          className
        )}
        aria-live="polite"
      >
        <span className="text-sm text-muted-foreground">加载更多</span>
      </div>
    )
  }

  // 没有更多数据状态 (Requirement 3.3)
  return (
    <div
      className={cn(
        'flex items-center justify-center py-6 px-4',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <span className="text-sm text-muted-foreground">{noMoreText}</span>
    </div>
  )
}

export type { LoadingStateFooterProps }
