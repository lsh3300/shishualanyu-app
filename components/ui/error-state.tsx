'use client'

import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react'
import { Button } from './button'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  type?: 'error' | 'network' | 'empty'
}

/**
 * 统一错误状态组件
 */
export function ErrorState({ 
  title = '加载失败', 
  message = '请稍后重试',
  onRetry,
  type = 'error'
}: ErrorStateProps) {
  const Icon = type === 'network' ? WifiOff : AlertCircle
  
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-4 max-w-sm">{message}</p>
      {onRetry && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRetry}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          重试
        </Button>
      )}
    </div>
  )
}

/**
 * 空状态组件
 */
export function EmptyState({ 
  title = '暂无数据', 
  message = '这里还没有内容',
  icon: CustomIcon,
  action
}: {
  title?: string
  message?: string
  icon?: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {CustomIcon ? (
        <div className="mb-4">{CustomIcon}</div>
      ) : (
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <span className="text-3xl">📭</span>
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-4 max-w-sm">{message}</p>
      {action}
    </div>
  )
}

/**
 * 网络错误状态
 */
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      type="network"
      title="网络连接失败"
      message="请检查您的网络连接后重试"
      onRetry={onRetry}
    />
  )
}

/**
 * 加载错误状态
 */
export function LoadError({ 
  message = '数据加载失败，请稍后重试',
  onRetry 
}: { 
  message?: string
  onRetry?: () => void 
}) {
  return (
    <ErrorState
      title="加载失败"
      message={message}
      onRetry={onRetry}
    />
  )
}
