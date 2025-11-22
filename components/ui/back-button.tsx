'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BackButtonProps {
  /**
   * 自定义返回路径，如果提供则直接跳转到该路径
   * 如果不提供，则使用浏览器历史记录返回
   */
  href?: string
  /**
   * 显示的文本
   */
  label?: string
  /**
   * 是否只显示图标
   */
  iconOnly?: boolean
  /**
   * 自定义样式类名
   */
  className?: string
  /**
   * 按钮变体
   */
  variant?: 'default' | 'ghost' | 'outline' | 'secondary' | 'link'
  /**
   * 按钮大小
   */
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

/**
 * 统一的返回按钮组件
 * 
 * 使用方式：
 * 1. 返回上一页: <BackButton />
 * 2. 返回特定页面: <BackButton href="/home" label="返回首页" />
 * 3. 只显示图标: <BackButton iconOnly />
 */
export function BackButton({
  href,
  label = '返回',
  iconOnly = false,
  className,
  variant = 'ghost',
  size = 'default',
}: BackButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (href) {
      // 如果提供了特定路径，直接跳转
      router.push(href)
    } else {
      // 否则使用浏览器历史记录返回
      router.back()
    }
  }

  if (iconOnly) {
    return (
      <Button
        variant={variant}
        size="icon"
        onClick={handleClick}
        className={cn('flex-shrink-0', className)}
        aria-label={label}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={cn('inline-flex items-center gap-2', className)}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  )
}
