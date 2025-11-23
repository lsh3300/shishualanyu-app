'use client'

import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLikes } from '@/hooks/use-likes'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

type ItemType = 'product' | 'course' | 'article'

interface LikeButtonProps {
  itemType: ItemType
  itemId: string
  initialLikesCount?: number
  variant?: 'default' | 'icon-only'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showCount?: boolean
}

/**
 * 点赞按钮组件 - 蓝染风格
 * 支持产品、课程、文章的点赞功能
 */
export function LikeButton({
  itemType,
  itemId,
  initialLikesCount = 0,
  variant = 'default',
  size = 'md',
  className,
  showCount = true,
}: LikeButtonProps) {
  const { likesCount, isLiked, isLoading, toggleLike } = useLikes(itemType, itemId)

  // 显示的点赞数（优先使用实时数据）
  const displayCount = likesCount > 0 ? likesCount : initialLikesCount

  // 尺寸样式
  const sizeStyles = {
    sm: {
      button: 'h-8 px-3 text-sm',
      icon: 'h-3.5 w-3.5',
      text: 'text-xs',
    },
    md: {
      button: 'h-10 px-4',
      icon: 'h-4 w-4',
      text: 'text-sm',
    },
    lg: {
      button: 'h-12 px-5 text-base',
      icon: 'h-5 w-5',
      text: 'text-base',
    },
  }

  const currentSize = sizeStyles[size]

  // 图标动画变体
  const heartVariants = {
    liked: {
      scale: [1, 1.3, 1],
      transition: { duration: 0.3 },
    },
    unliked: {
      scale: 1,
      transition: { duration: 0.2 },
    },
  }

  // 数字动画变体
  const countVariants = {
    initial: { y: -20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 20, opacity: 0 },
  }

  if (variant === 'icon-only') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleLike}
        disabled={isLoading}
        className={cn(
          'group rounded-full transition-all duration-300',
          'hover:bg-primary/10 hover:scale-110',
          'active:scale-95',
          isLiked && 'bg-primary/5',
          className
        )}
        aria-label={isLiked ? '取消点赞' : '点赞'}
      >
        <motion.div
          variants={heartVariants}
          animate={isLiked ? 'liked' : 'unliked'}
        >
          <Heart
            className={cn(
              currentSize.icon,
              'transition-colors duration-300',
              isLiked
                ? 'text-red-500 fill-red-500'
                : 'text-muted-foreground group-hover:text-red-400'
            )}
          />
        </motion.div>
      </Button>
    )
  }

  return (
    <Button
      variant={isLiked ? 'secondary' : 'outline'}
      onClick={toggleLike}
      disabled={isLoading}
      className={cn(
        'group gap-2 transition-all duration-300',
        'hover:scale-105 active:scale-95',
        'shadow-sm hover:shadow-md',
        isLiked && 'bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30',
        currentSize.button,
        className
      )}
      aria-label={isLiked ? '取消点赞' : '点赞'}
    >
      {/* 点赞图标 */}
      <motion.div
        variants={heartVariants}
        animate={isLiked ? 'liked' : 'unliked'}
      >
        <Heart
          className={cn(
            currentSize.icon,
            'transition-all duration-300',
            isLiked
              ? 'text-red-500 fill-red-500'
              : 'text-muted-foreground group-hover:text-red-400 group-hover:fill-red-50'
          )}
        />
      </motion.div>

      {/* 点赞数 */}
      {showCount && (
        <div className={cn('relative min-w-[2ch] text-center', currentSize.text)}>
          <AnimatePresence mode="wait">
            <motion.span
              key={displayCount}
              variants={countVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
              className={cn(
                'inline-block font-medium',
                isLiked ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {displayCount}
            </motion.span>
          </AnimatePresence>
        </div>
      )}

      {/* 文字标签 */}
      <span
        className={cn(
          'font-medium transition-colors duration-200',
          currentSize.text,
          isLiked ? 'text-primary' : 'text-muted-foreground'
        )}
      >
        {isLiked ? '已点赞' : '点赞'}
      </span>

      {/* 粒子效果（点赞时） */}
      {isLiked && (
        <motion.div
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 rounded-full bg-gradient-to-r from-red-200 to-pink-200 pointer-events-none"
        />
      )}
    </Button>
  )
}
