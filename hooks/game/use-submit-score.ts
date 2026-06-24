'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { fetchJson } from '@/lib/fetch-json'
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
  const { getToken } = useAuth()

  const submitScore = async ({
    clothId,
    layers,
    onSuccess,
    onError
  }: SubmitScoreOptions) => {
    try {
      setIsSubmitting(true)
      setError(null)

      const token = await getToken()
      if (!token) {
        throw new Error('请先登录后再进行评分')
      }

      const result = await fetchJson<{ success: boolean; data: ScoreSubmitResult; error?: unknown }>(
        '/api/game/score',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            cloth_id: clothId,
            layers: layers
          }),
          timeoutMs: 12000,
          retries: 1,
        }
      )

      if (!result.success) {
        const obj = typeof result.error === 'object' && result.error ? (result.error as Record<string, unknown>) : null
        const userMessage = obj && typeof obj.userMessage === 'string' ? obj.userMessage : null
        const message = obj && typeof obj.message === 'string' ? obj.message : null
        const errorMessage = userMessage || message || (typeof result.error === 'string' ? result.error : null) || '评分失败'
        throw new Error(errorMessage)
      }

      // 成功回调
      if (onSuccess) {
        onSuccess(result.data)
      }

      return result.data

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '提交失败'
      setError(errorMessage)
      
      if (onError) {
        onError(err instanceof Error ? err : new Error(errorMessage))
      }
      
      throw err instanceof Error ? err : new Error(errorMessage)
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
