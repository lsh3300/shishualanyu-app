import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { 
  PlayerProgress, 
  GameSession, 
  GameAction, 
  GameResult,
  GameStage 
} from '../types/game.types'

interface GameStore {
  // 玩家数据
  player: PlayerProgress | null
  
  // 当前游戏会话
  currentSession: GameSession | null
  
  // UI 状态
  isPaused: boolean
  showHint: boolean
  selectedTool: string | null
  
  // 游戏统计
  totalPlayTime: number
  
  // Actions - 玩家相关
  initPlayer: (userId: string) => void
  updateCoins: (amount: number) => void
  updateLevel: (level: number) => void
  addAchievement: (achievementId: string) => void
  
  // Actions - 游戏会话
  startLevel: (levelId: number) => void
  endLevel: (result: GameResult) => void
  updateStage: (stage: GameStage) => void
  performAction: (action: GameAction) => void
  undoAction: () => void
  
  // Actions - UI 控制
  togglePause: () => void
  toggleHint: () => void
  selectTool: (toolId: string | null) => void
  
  // Actions - 进度保存
  saveProgress: () => Promise<void>
  loadProgress: (userId: string) => Promise<void>
  resetSession: () => void
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // 初始状态
      player: null,
      currentSession: null,
      isPaused: false,
      showHint: false,
      selectedTool: null,
      totalPlayTime: 0,

      // 初始化玩家
      initPlayer: (userId: string) => {
        const newPlayer: PlayerProgress = {
          userId,
          level: 1,
          exp: 0,
          coins: 500,
          achievements: [],
          completedLevels: [],
          levelStars: {},
          inventory: ['fold-spiral', 'rubber-band', 'dye-blue'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set({ player: newPlayer })
      },

      // 更新金币
      updateCoins: (amount: number) => {
        set((state) => {
          if (!state.player) return state
          return {
            player: {
              ...state.player,
              coins: state.player.coins + amount,
              updatedAt: new Date().toISOString(),
            },
          }
        })
      },

      // 更新等级
      updateLevel: (level: number) => {
        set((state) => {
          if (!state.player) return state
          return {
            player: {
              ...state.player,
              level,
              updatedAt: new Date().toISOString(),
            },
          }
        })
      },

      // 添加成就
      addAchievement: (achievementId: string) => {
        set((state) => {
          if (!state.player) return state
          if (state.player.achievements.includes(achievementId)) return state
          return {
            player: {
              ...state.player,
              achievements: [...state.player.achievements, achievementId],
              updatedAt: new Date().toISOString(),
            },
          }
        })
      },

      // 开始关卡
      startLevel: (levelId: number) => {
        const newSession: GameSession = {
          levelId,
          startTime: Date.now(),
          currentStage: 'prepare',
          actions: [],
          fabricData: {
            type: 'cotton',
            size: { width: 400, height: 400 },
            tiePoints: [],
            dyeLayers: [],
          },
        }
        set({ currentSession: newSession, isPaused: false })
      },

      // 结束关卡
      endLevel: (result: GameResult) => {
        set((state) => {
          if (!state.player) return state

          const updatedPlayer = { ...state.player }
          
          // 更新完成关卡
          if (!updatedPlayer.completedLevels.includes(result.levelId)) {
            updatedPlayer.completedLevels.push(result.levelId)
          }
          
          // 更新星数（只保留最高星数）
          const currentStars = updatedPlayer.levelStars[result.levelId] || 0
          if (result.stars > currentStars) {
            updatedPlayer.levelStars[result.levelId] = result.stars
          }
          
          // 添加金币和经验
          updatedPlayer.coins += result.coinsEarned
          updatedPlayer.exp += result.expEarned
          
          // 添加新成就
          if (result.achievements) {
            result.achievements.forEach(achId => {
              if (!updatedPlayer.achievements.includes(achId)) {
                updatedPlayer.achievements.push(achId)
              }
            })
          }
          
          updatedPlayer.updatedAt = new Date().toISOString()

          return {
            player: updatedPlayer,
            currentSession: null,
          }
        })
      },

      // 更新游戏阶段
      updateStage: (stage: GameStage) => {
        set((state) => {
          if (!state.currentSession) return state
          return {
            currentSession: {
              ...state.currentSession,
              currentStage: stage,
            },
          }
        })
      },

      // 执行游戏操作
      performAction: (action: GameAction) => {
        set((state) => {
          if (!state.currentSession) return state
          return {
            currentSession: {
              ...state.currentSession,
              actions: [...state.currentSession.actions, action],
            },
          }
        })
      },

      // 撤销操作
      undoAction: () => {
        set((state) => {
          if (!state.currentSession || state.currentSession.actions.length === 0) {
            return state
          }
          return {
            currentSession: {
              ...state.currentSession,
              actions: state.currentSession.actions.slice(0, -1),
            },
          }
        })
      },

      // 切换暂停
      togglePause: () => {
        set((state) => ({ isPaused: !state.isPaused }))
      },

      // 切换提示
      toggleHint: () => {
        set((state) => ({ showHint: !state.showHint }))
      },

      // 选择工具
      selectTool: (toolId: string | null) => {
        set({ selectedTool: toolId })
      },

      // 保存进度（本地 + 云端）
      saveProgress: async () => {
        const state = get()
        if (!state.player) return

        try {
          // 本地已通过 persist 中间件自动保存
          
          // TODO: 云端同步到 Supabase
          // const { data, error } = await supabase
          //   .from('game_progress')
          //   .upsert({
          //     user_id: state.player.userId,
          //     data: state.player,
          //     updated_at: new Date().toISOString()
          //   })
          
          console.log('✅ 进度已保存', state.player)
        } catch (error) {
          console.error('❌ 保存进度失败', error)
        }
      },

      // 加载进度
      loadProgress: async (userId: string) => {
        try {
          // TODO: 从 Supabase 加载
          // const { data, error } = await supabase
          //   .from('game_progress')
          //   .select('*')
          //   .eq('user_id', userId)
          //   .single()
          
          // if (data) {
          //   set({ player: data.data })
          // } else {
          //   // 创建新玩家
          //   get().initPlayer(userId)
          // }
          
          // 临时：如果本地没有数据，创建新玩家
          const state = get()
          if (!state.player) {
            get().initPlayer(userId)
          }
          
          console.log('✅ 进度已加载')
        } catch (error) {
          console.error('❌ 加载进度失败', error)
          get().initPlayer(userId)
        }
      },

      // 重置会话
      resetSession: () => {
        set({ currentSession: null, isPaused: false, showHint: false, selectedTool: null })
      },
    }),
    {
      name: 'indigo-game-storage', // localStorage key
      partialize: (state) => ({
        player: state.player,
        totalPlayTime: state.totalPlayTime,
      }), // 只持久化玩家数据
    }
  )
)
