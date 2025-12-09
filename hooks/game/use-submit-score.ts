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

/**
 * 提交作品评分Hook
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

      // 获取当前用户
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('未登录')
      }

      // 调用评分API
      const response = await fetch('/api/game/score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cloth_id: clothId,
          layers: layers
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '评分失败')
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || '评分失败')
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
