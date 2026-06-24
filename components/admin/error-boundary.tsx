'use client'

import { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * 错误边界属性
 */
interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  onReset?: () => void
}

/**
 * 错误边界状态
 */
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * 错误边界组件
 * 捕获子组件的 JavaScript 错误，显示备用 UI
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    this.props.onReset?.()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="rounded-full bg-destructive/10 p-3">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-foreground">
            出错了
          </h3>
          <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
            {this.state.error?.message || '页面加载时发生错误'}
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={this.handleReset}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            重试
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * 页面级错误边界属性
 */
interface PageErrorBoundaryProps {
  children: ReactNode
  pageName?: string
}

/**
 * 页面级错误边界
 * 提供更详细的错误信息和返回选项
 */
export function PageErrorBoundary({ children, pageName }: PageErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px] py-12 px-4">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
          <h2 className="mt-6 text-xl font-semibold text-foreground">
            {pageName ? `${pageName}加载失败` : '页面加载失败'}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground text-center max-w-md">
            抱歉，页面加载时发生了错误。请尝试刷新页面或返回上一页。
          </p>
          <div className="mt-6 flex gap-3">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
            >
              返回上一页
            </Button>
            <Button
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新页面
            </Button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}

export default ErrorBoundary
