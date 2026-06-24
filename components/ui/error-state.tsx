'use client'

import { AlertCircle, RefreshCw, WifiOff, Clock, ServerCrash } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

// ============================================================================
// Error Message Mapping - Requirements: 7.5
// ============================================================================

/**
 * 错误消息映射表
 * 将错误类型映射为用户友好的中文消息
 */
export const ERROR_MESSAGES: Record<string, string> = {
  'NetworkError': '网络连接失败，请检查网络设置',
  'TimeoutError': '请求超时，请稍后重试',
  'ServerError': '服务器繁忙，请稍后重试',
  'AbortError': '请求已取消',
  'TypeError': '数据格式错误，请刷新页面',
  'default': '加载失败，请重试'
}

/**
 * 根据错误对象获取用户友好的中文错误消息
 */
export function getErrorMessage(error: Error | null | undefined): string {
  if (!error) return ERROR_MESSAGES.default
  
  const errorName = error.name || ''
  const errorMessage = error.message || ''
  
  // Check for specific error types
  if (errorName === 'AbortError' || errorMessage.includes('abort')) {
    return ERROR_MESSAGES.AbortError
  }
  
  if (errorName === 'TypeError' || errorMessage.includes('type')) {
    return ERROR_MESSAGES.TypeError
  }
  
  if (errorMessage.includes('timeout') || errorMessage.includes('超时')) {
    return ERROR_MESSAGES.TimeoutError
  }
  
  if (errorMessage.includes('network') || errorMessage.includes('网络') || 
      errorMessage.includes('Failed to fetch') || errorMessage.includes('fetch')) {
    return ERROR_MESSAGES.NetworkError
  }
  
  if (errorMessage.includes('500') || errorMessage.includes('502') || 
      errorMessage.includes('503') || errorMessage.includes('server')) {
    return ERROR_MESSAGES.ServerError
  }
  
  // Return the error message if it's already in Chinese
  if (/[\u4e00-\u9fa5]/.test(errorMessage)) {
    return errorMessage
  }
  
  return ERROR_MESSAGES.default
}

/**
 * 根据错误类型获取对应的图标
 */
function getErrorIcon(error: Error | null | undefined) {
  if (!error) return AlertCircle
  
  const errorMessage = error.message || ''
  
  if (errorMessage.includes('timeout') || errorMessage.includes('超时')) {
    return Clock
  }
  
  if (errorMessage.includes('network') || errorMessage.includes('网络') || 
      errorMessage.includes('Failed to fetch') || errorMessage.includes('fetch')) {
    return WifiOff
  }
  
  if (errorMessage.includes('500') || errorMessage.includes('502') || 
      errorMessage.includes('503') || errorMessage.includes('server')) {
    return ServerCrash
  }
  
  return AlertCircle
}

// ============================================================================
// Full Page Error State - Requirements: 7.1
// ============================================================================

interface FullPageErrorProps {
  /** 错误对象 */
  error: Error | null
  /** 重试回调 */
  onRetry?: () => void
  /** 自定义标题 */
  title?: string
  /** 自定义描述 */
  description?: string
  /** 自定义类名 */
  className?: string
}

/**
 * 全屏错误状态组件
 * 用于初始加载失败时显示
 * 
 * Requirements: 7.1
 */
export function FullPageError({
  error,
  onRetry,
  title = '加载失败',
  description,
  className,
}: FullPageErrorProps) {
  const ErrorIcon = getErrorIcon(error)
  const errorMessage = description || getErrorMessage(error)
  
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center min-h-[60vh] px-6 py-12',
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      {/* 错误图标 */}
      <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
        <ErrorIcon 
          className="w-10 h-10 text-destructive" 
          aria-hidden="true" 
        />
      </div>
      
      {/* 错误标题 */}
      <h2 className="text-xl font-bold text-foreground mb-2 text-center">
        {title}
      </h2>
      
      {/* 错误描述 */}
      <p className="text-sm text-muted-foreground text-center mb-6 max-w-xs">
        {errorMessage}
      </p>
      
      {/* 重试按钮 */}
      {onRetry && (
        <Button
          onClick={onRetry}
          className="gap-2"
          aria-label="重试加载"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          重新加载
        </Button>
      )}
    </div>
  )
}

// ============================================================================
// Inline Error State - Requirements: 7.2
// ============================================================================

interface InlineErrorProps {
  /** 错误对象 */
  error: Error | null
  /** 重试回调 */
  onRetry?: () => void
  /** 自定义错误文本 */
  errorText?: string
  /** 自定义类名 */
  className?: string
}

/**
 * 内联错误状态组件
 * 用于加载更多失败时显示
 * 
 * Requirements: 7.2, 7.3, 7.4
 */
export function InlineError({
  error,
  onRetry,
  errorText,
  className,
}: InlineErrorProps) {
  const errorMessage = errorText || getErrorMessage(error)
  
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
        <span className="text-sm font-medium">{errorMessage}</span>
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

// ============================================================================
// Empty State Component
// ============================================================================

interface EmptyStateProps {
  /** 标题 */
  title?: string
  /** 描述 */
  description?: string
  /** 自定义图标 */
  icon?: React.ReactNode
  /** 操作按钮 */
  action?: React.ReactNode
  /** 自定义类名 */
  className?: string
}

/**
 * 空状态组件
 * 用于没有数据时显示
 */
export function EmptyState({
  title = '暂无数据',
  description = '当前没有可显示的内容',
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-6',
        className
      )}
      role="status"
      aria-live="polite"
    >
      {/* 图标 */}
      {icon || (
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-muted-foreground" aria-hidden="true" />
        </div>
      )}
      
      {/* 标题 */}
      <h3 className="text-lg font-medium text-foreground mb-1 text-center">
        {title}
      </h3>
      
      {/* 描述 */}
      <p className="text-sm text-muted-foreground text-center mb-4 max-w-xs">
        {description}
      </p>
      
      {/* 操作按钮 */}
      {action}
    </div>
  )
}

export type { FullPageErrorProps, InlineErrorProps, EmptyStateProps }
