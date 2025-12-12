'use client'

import { useState } from 'react'
import { getSupabaseClient } from '@/lib/supabaseClient'
import type { ClothLayer, ScoreSubmitResult } from '@/types/game.types'

interface SubmitScoreOptions {
  clothId: string
  layers: ClothLayer[]
  onSuccess?: (result: ScoreSubmitResult) => void
  onError?: (error: Error) => void
}

// 检查是否为开发环境
const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * 提交作品评分Hook
 * 
 * 支持两种模式：
 * 1. 正式模式：用户已登录，正常提交评分
 * 2. 测试模式：开发环境下未登录，使用测试模式header
 */
export function useSubmitScore() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseClient()

  const submitScore = async ({
    clothId,
    layers,
    onSuccess,
    onError
  }: SubmitScoreOptions) => {
    try {
      setIsSubmitting(true)
      setError(null)

      // 获取当前用户和session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('请先登录后再进行评分')
      }
      
      // 构建请求头，包含 Authorization token
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }

      // 调用评分API
      const response = await fetch('/api/game/score', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          cloth_id: clothId,
          layers: layers
        })
      })

      const result = await response.json()

      if (!response.ok) {
        // 提取用户友好的错误信息
        const errorMessage = result.error?.userMessage || result.error?.message || result.error || '评分失败'
        throw new Error(errorMessage)
      }

      if (!result.success) {
        const errorMessage = result.error?.userMessage || result.error?.message || result.error || '评分失败'
        throw new Error(errorMessage)
      }

      // 如果是测试模式，显示提示
      if (result.isTestMode) {
        console.log('🧪 测试模式评分结果:', result.data)
      }

      // 成功回调
      if (onSuccess) {
        onSuccess(result.data)
      }

      return result.data

    } catch (err: any) {
      const errorMessage = err.message || '提交失败'
      setError(errorMessage)
      
      if (onError) {
        onError(err)
      }
      
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    submitScore,
    isSubmitting,
    error
  }
}
