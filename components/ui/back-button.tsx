'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BackButtonProps {
  href?: string
  label?: string
  iconOnly?: boolean
  className?: string
  variant?: 'default' | 'ghost' | 'outline' | 'secondary' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  fallbackHref?: string
}

export function BackButton({
  href,
  label = '返回',
  iconOnly = false,
  className,
  variant = 'ghost',
  size = 'default',
  fallbackHref = '/',
}: BackButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (href) {
      router.push(href)
      return
    }

    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
      return
    }

    router.push(fallbackHref)
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
