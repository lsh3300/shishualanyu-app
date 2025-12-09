'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { getSupabaseClient } from '@/lib/supabaseClient'
import type { 
  PlayerProfile, 
  LevelInfo,
  ExpGainResult 
} from '@/types/game.types'

/**
 * 玩家档案 Hook
 * 管理玩家等级、经验、货币等核心数据
 */
export function usePlayerProfile() {
  const [profile, setProfile] = useState<PlayerProfile | null>(null)
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = useMemo(() => getSupabaseClient(), [])

  /**
   * 计算等级信息
   */
  const calculateLevelInfo = useCallback((totalExp: number): LevelInfo => {
    const baseExp = 100
    const exponent = 1.5
    
    let level = 1
    let expAccumulated = 0
    
    // 计算当前等级
    while (level < 100) {
      const expForNext = Math.floor(baseExp * Math.pow(level, exponent))
      if (expAccumulated + expForNext > totalExp) {
        break
      }
      expAccumulated += expForNext
      level++
    }
    
    const currentLevelExp = totalExp - expAccumulated
    const expToNextLevel = Math.floor(baseExp * Math.pow(level, exponent))
    const progress = expToNextLevel > 0 ? currentLevelExp / expToNextLevel : 1
    
    return {
      level,
      currentLevelExp,
      expToNextLevel,
      progress
    }
  }, [])

  /**
   * 加载玩家档案
   */
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // 获取当前用户
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('未登录')
        setLoading(false)
        return
      }

      // 查询玩家档案
      const { data, error: dbError } = await supabase
        .from('player_profile')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (dbError) {
        // 如果档案不存在，自动创建
        if (dbError.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('player_profile')
            .insert({
              user_id: user.id,
              dye_house_name: '无名染坊'
            })
            .select()
            .single()

          if (createError) {
            throw createError
          }

          setProfile(newProfile)
          setLevelInfo(calculateLevelInfo(0))
        } else {
          throw dbError
        }
      } else {
        setProfile(data)
        setLevelInfo(calculateLevelInfo(data.exp))
      }

      setLoading(false)
    } catch (err: any) {
      console.error('加载玩家档案失败:', err)
      setError(err.message || '加载失败')
      setLoading(false)
    }
  }, [supabase, calculateLevelInfo])

  /**
   * 初始加载
   */
  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  /**
   * 订阅档案变化（实时更新）
   */
  useEffect(() => {
    if (!profile) return

    const channel = supabase
      .channel('player_profile_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'player_profile',
          filter: `user_id=eq.${profile.user_id}`
        },
        (payload: any) => {
          const updated = payload.new as PlayerProfile
          setProfile(updated)
          setLevelInfo(calculateLevelInfo(updated.exp))
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [profile?.user_id, supabase, calculateLevelInfo])

  /**
   * 添加经验值
   */
  const addExp = useCallback(async (amount: number): Promise<ExpGainResult | null> => {
    if (!profile) return null

    try {
      const { data, error } = await supabase
        .rpc('add_experience', {
          p_user_id: profile.user_id,
          p_exp_gain: amount
        })

      if (error) throw error

      // 手动刷新档案
      await loadProfile()

      return data
    } catch (err: any) {
      console.error('添加经验失败:', err)
      setError(err.message)
      return null
    }
  }, [profile, supabase, loadProfile])

  /**
   * 添加货币
   */
  const addCurrency = useCallback(async (amount: number): Promise<number | null> => {
    if (!profile) return null

    try {
      const { data, error } = await supabase
        .rpc('add_currency', {
          p_user_id: profile.user_id,
          p_amount: amount
        })

      if (error) throw error

      // 手动刷新档案
      await loadProfile()

      return data
    } catch (err: any) {
      console.error('添加货币失败:', err)
      setError(err.message)
      return null
    }
  }, [profile, supabase, loadProfile])

  /**
   * 更新染坊名称
   */
  const updateDyeHouseName = useCallback(async (name: string): Promise<boolean> => {
    if (!profile) return false

    try {
      const { error } = await supabase
        .from('player_profile')
        .update({ dye_house_name: name })
        .eq('user_id', profile.user_id)

      if (error) throw error

      await loadProfile()
      return true
    } catch (err: any) {
      console.error('更新染坊名称失败:', err)
      setError(err.message)
      return false
    }
  }, [profile, supabase, loadProfile])

  /**
   * 刷新档案
   */
  const refresh = useCallback(() => {
    loadProfile()
  }, [loadProfile])

  return {
    // 数据
    profile,
    levelInfo,
    
    // 状态
    loading,
    error,
    
    // 操作
    addExp,
    addCurrency,
    updateDyeHouseName,
    refresh
  }
}
