'use client'

/**
 * 玩家档案 Hook
 * Player Profile Hook
 * 
 * 管理玩家等级、经验、货币等核心数据
 * 优化版本：添加错误处理和用户反馈
 */

import { useEffect, useState, useCallback, useMemo } from 'react'
import { getSupabaseClient } from '@/lib/supabaseClient'
import { LevelConfig, PlayerDefaults } from '@/lib/game/config'
import { toGameError } from '@/lib/game/errors'
import type { 
  PlayerProfile, 
  LevelInfo,
  ExpGainResult 
} from '@/types/game.types'

// ============================================================================
// 类型定义
// ============================================================================

interface UsePlayerProfileReturn {
  /** 玩家档案数据 */
  profile: PlayerProfile | null
  /** 等级信息（计算后的） */
  levelInfo: LevelInfo | null
  /** 是否正在加载 */
  loading: boolean
  /** 错误信息 */
  error: string | null
  /** 是否已初始化 */
  initialized: boolean
  /** 添加经验值 */
  addExp: (amount: number) => Promise<ExpGainResult | null>
  /** 添加货币 */
  addCurrency: (amount: number) => Promise<number | null>
  /** 更新染坊名称 */
  updateDyeHouseName: (name: string) => Promise<boolean>
  /** 刷新档案 */
  refresh: () => void
}

// ============================================================================
// 等级计算函数
// ============================================================================

/**
 * 计算指定等级所需的经验值
 */
function getExpForLevel(level: number): number {
  return Math.floor(LevelConfig.baseExp * Math.pow(level, LevelConfig.exponent))
}

/**
 * 根据总经验值计算等级信息
 */
function calculateLevelInfo(totalExp: number): LevelInfo {
  let level = 1
  let expAccumulated = 0
  
  // 计算当前等级
  while (level < LevelConfig.maxLevel) {
    const expForNext = getExpForLevel(level)
    if (expAccumulated + expForNext > totalExp) {
      break
    }
    expAccumulated += expForNext
    level++
  }
  
  const currentLevelExp = totalExp - expAccumulated
  const expToNextLevel = getExpForLevel(level)
  const progress = expToNextLevel > 0 ? currentLevelExp / expToNextLevel : 1
  
  return {
    level,
    currentLevelExp,
    expToNextLevel,
    progress: Math.min(progress, 1) // 确保不超过1
  }
}

// ============================================================================
// Hook 实现
// ============================================================================

export function usePlayerProfile(): UsePlayerProfileReturn {
  const [profile, setProfile] = useState<PlayerProfile | null>(null)
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)
  
  const supabase = useMemo(() => getSupabaseClient(), [])

  /**
   * 加载玩家档案
   */
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // 获取当前用户
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.error('认证错误:', authError.message)
        setError('获取用户信息失败')
        setLoading(false)
        return
      }

      if (!user) {
        setError('请先登录')
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
          console.log('📝 创建新玩家档案...')
          
          const newProfile = {
            user_id: user.id,
            dye_house_name: PlayerDefaults.dyeHouseName,
            level: PlayerDefaults.initialLevel,
            exp: PlayerDefaults.initialExp,
            currency: PlayerDefaults.initialCurrency,
            total_cloths_created: 0,
            total_score: 0,
            highest_score: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }

          const { data: createdProfile, error: createError } = await supabase
            .from('player_profile')
            .insert(newProfile)
            .select()
            .single()

          if (createError) {
            console.error('创建档案失败:', createError)
            setError('创建玩家档案失败')
            setLoading(false)
            return
          }

          setProfile(createdProfile)
          setLevelInfo(calculateLevelInfo(0))
          console.log('✅ 玩家档案创建成功')
        } else {
          console.error('查询档案失败:', dbError)
          setError('加载玩家档案失败')
          setLoading(false)
          return
        }
      } else {
        setProfile(data)
        setLevelInfo(calculateLevelInfo(data.exp || 0))
      }

      setInitialized(true)
      setLoading(false)
    } catch (err: unknown) {
      const gameError = toGameError(err)
      console.error('加载玩家档案失败:', gameError.message)
      setError(gameError.userMessage)
      setLoading(false)
    }
  }, [supabase])

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
    if (!profile?.user_id) return

    const channel = supabase
      .channel(`player_profile_${profile.user_id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'player_profile',
          filter: `user_id=eq.${profile.user_id}`
        },
        (payload: any) => {
          console.log('📡 档案实时更新:', payload.new)
          const updated = payload.new as PlayerProfile
          setProfile(updated)
          setLevelInfo(calculateLevelInfo(updated.exp || 0))
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [profile?.user_id, supabase])

  /**
   * 添加经验值（乐观更新）
   */
  const addExp = useCallback(async (amount: number): Promise<ExpGainResult | null> => {
    if (!profile) {
      setError('玩家档案未加载')
      return null
    }

    try {
      const oldLevel = profile.level
      const newExp = (profile.exp || 0) + amount
      const newLevelInfo = calculateLevelInfo(newExp)
      const leveledUp = newLevelInfo.level > oldLevel

      // 计算升级奖励
      let currencyReward = 0
      if (leveledUp) {
        currencyReward = (newLevelInfo.level - oldLevel) * LevelConfig.levelUpCurrencyReward
      }

      // 乐观更新 UI
      const newCurrency = (profile.currency || 0) + currencyReward
      setProfile(prev => prev ? {
        ...prev,
        exp: newExp,
        level: newLevelInfo.level,
        currency: newCurrency
      } : null)
      setLevelInfo(newLevelInfo)

      // 更新数据库
      const { error: updateError } = await supabase
        .from('player_profile')
        .update({
          exp: newExp,
          level: newLevelInfo.level,
          currency: newCurrency,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', profile.user_id)

      if (updateError) {
        // 回滚乐观更新
        setProfile(profile)
        setLevelInfo(calculateLevelInfo(profile.exp || 0))
        console.error('更新经验失败:', updateError)
        setError('更新经验失败')
        return null
      }

      return {
        leveled_up: leveledUp,
        old_level: oldLevel,
        new_level: newLevelInfo.level,
        new_exp: newExp,
        currency_reward: currencyReward
      }
    } catch (err: unknown) {
      const gameError = toGameError(err)
      console.error('添加经验失败:', gameError.message)
      setError(gameError.userMessage)
      return null
    }
  }, [profile, supabase])

  /**
   * 添加货币（乐观更新）
   */
  const addCurrency = useCallback(async (amount: number): Promise<number | null> => {
    if (!profile) {
      setError('玩家档案未加载')
      return null
    }

    const oldCurrency = profile.currency || 0
    const newCurrency = oldCurrency + amount

    // 乐观更新 UI
    setProfile(prev => prev ? { ...prev, currency: newCurrency } : null)

    try {
      const { error: updateError } = await supabase
        .from('player_profile')
        .update({
          currency: newCurrency,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', profile.user_id)

      if (updateError) {
        // 回滚乐观更新
        setProfile(prev => prev ? { ...prev, currency: oldCurrency } : null)
        console.error('更新货币失败:', updateError)
        setError('更新货币失败')
        return null
      }

      return newCurrency
    } catch (err: unknown) {
      // 回滚乐观更新
      setProfile(prev => prev ? { ...prev, currency: oldCurrency } : null)
      const gameError = toGameError(err)
      console.error('添加货币失败:', gameError.message)
      setError(gameError.userMessage)
      return null
    }
  }, [profile, supabase])

  /**
   * 更新染坊名称（乐观更新）
   */
  const updateDyeHouseName = useCallback(async (name: string): Promise<boolean> => {
    if (!profile) {
      setError('玩家档案未加载')
      return false
    }

    if (!name || name.trim().length === 0) {
      setError('染坊名称不能为空')
      return false
    }

    if (name.length > 20) {
      setError('染坊名称不能超过20个字符')
      return false
    }

    const oldName = profile.dye_house_name
    const newName = name.trim()

    // 乐观更新 UI
    setProfile(prev => prev ? { ...prev, dye_house_name: newName } : null)

    try {
      const { error: updateError } = await supabase
        .from('player_profile')
        .update({ 
          dye_house_name: newName,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', profile.user_id)

      if (updateError) {
        // 回滚乐观更新
        setProfile(prev => prev ? { ...prev, dye_house_name: oldName } : null)
        console.error('更新染坊名称失败:', updateError)
        setError('更新染坊名称失败')
        return false
      }

      return true
    } catch (err: unknown) {
      // 回滚乐观更新
      setProfile(prev => prev ? { ...prev, dye_house_name: oldName } : null)
      const gameError = toGameError(err)
      console.error('更新染坊名称失败:', gameError.message)
      setError(gameError.userMessage)
      return false
    }
  }, [profile, supabase])

  /**
   * 刷新档案
   */
  const refresh = useCallback(() => {
    loadProfile()
  }, [loadProfile])

  return {
    profile,
    levelInfo,
    loading,
    error,
    initialized,
    addExp,
    addCurrency,
    updateDyeHouseName,
    refresh
  }
}
