'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>
  placeholder?: string
  isLoading?: boolean
  maxLength?: number
  buttonText?: string
  autoFocus?: boolean
  className?: string
}

/**
 * 评论表单组件 - 蓝染风格
 */
export function CommentForm({
  onSubmit,
  placeholder = '发表你的评论...',
  isLoading = false,
  maxLength = 2000,
  buttonText = '发布评论',
  autoFocus = false,
  className,
}: CommentFormProps) {
  const [content, setContent] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const trimmedContent = content.trim()
    if (!trimmedContent) return

    await onSubmit(trimmedContent)
    setContent('') // 清空输入框
  }

  const currentLength = content.length
  const isOverLimit = currentLength > maxLength
  const canSubmit = content.trim().length > 0 && !isOverLimit && !isLoading

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={cn('space-y-3', className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* 输入框 */}
      <div className="relative">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          disabled={isLoading}
          className={cn(
            'min-h-[100px] resize-none transition-all duration-300',
            'border-2',
            isFocused && 'border-primary shadow-md',
            isOverLimit && 'border-destructive',
            'focus:ring-2 focus:ring-primary/20'
          )}
          maxLength={maxLength + 100} // 允许超出以显示错误
        />

        {/* 聚焦时的蓝染风格光晕 */}
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 -z-10 rounded-lg bg-gradient-to-br from-primary/5 to-secondary/5 blur-xl"
          />
        )}
      </div>

      {/* 底部操作栏 */}
      <div className="flex items-center justify-between gap-4">
        {/* 字数统计 */}
        <div className="flex items-center gap-2 text-sm">
          <span
            className={cn(
              'transition-colors duration-200',
              isOverLimit
                ? 'text-destructive font-medium'
                : currentLength > maxLength * 0.9
                ? 'text-orange-500'
                : 'text-muted-foreground'
            )}
          >
            {currentLength} / {maxLength}
          </span>
          
          {isOverLimit && (
            <motion.span
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-destructive text-xs"
            >
              超出字数限制
            </motion.span>
          )}
        </div>

        {/* 发布按钮 */}
        <Button
          type="submit"
          disabled={!canSubmit}
          className={cn(
            'gap-2 transition-all duration-300',
            'bg-gradient-to-r from-primary to-primary/90',
            'hover:from-primary/90 hover:to-primary',
            'hover:scale-105 active:scale-95',
            'shadow-md hover:shadow-lg',
            !canSubmit && 'opacity-50 cursor-not-allowed'
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>发布中...</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>{buttonText}</span>
            </>
          )}
        </Button>
      </div>

      {/* 提示文本 */}
      {isFocused && !isOverLimit && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="text-xs text-muted-foreground"
        >
          💡 友善发言，理性评论
        </motion.p>
      )}
    </motion.form>
  )
}
