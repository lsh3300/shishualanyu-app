/**
 * 游戏系统配置
 * Game System Configuration
 */

// ============================================================================
// 环境配置
// ============================================================================

export const GameConfig = {
  /** 是否为生产环境 */
  isProduction: process.env.NODE_ENV === 'production',
  
  /** 是否允许测试模式（仅开发环境） */
  allowTestMode: process.env.NODE_ENV === 'development',
  
  /** 测试模式请求头名称 */
  testModeHeader: 'X-Game-Test-Mode',
  
  /** 测试模式密钥（开发环境使用） */
  testModeSecret: process.env.GAME_TEST_SECRET || 'dev-test-secret',
} as const;

// ============================================================================
// 等级系统配置
// ============================================================================

export const LevelConfig = {
  /** 基础经验值 */
  baseExp: 100,
  
  /** 经验增长指数 */
  exponent: 1.5,
  
  /** 最大等级 */
  maxLevel: 100,
  
  /** 升级货币奖励基数 */
  levelUpCurrencyReward: 50,
} as const;

// ============================================================================
// 评分系统配置
// ============================================================================

export const ScoreConfig = {
  /** 评分等级边界 */
  gradeBoundaries: {
    SSS: 95,
    SS: 90,
    S: 80,
    A: 70,
    B: 60,
    C: 0,
  } as const,
  
  /** 等级奖励配置 */
  gradeRewards: {
    SSS: { exp: 200, currency: 100 },
    SS: { exp: 150, currency: 70 },
    S: { exp: 100, currency: 50 },
    A: { exp: 70, currency: 30 },
    B: { exp: 50, currency: 20 },
    C: { exp: 30, currency: 10 },
  } as const,
  
  /** 评分权重 */
  weights: {
    color: 0.25,
    pattern: 0.25,
    creativity: 0.25,
    technique: 0.25,
  } as const,
  
  /** 蓝染最佳染色深度范围 */
  optimalDyeDepthRange: {
    min: 0.4,
    max: 0.8,
  } as const,
} as const;

// ============================================================================
// 背包系统配置
// ============================================================================

export const InventoryConfig = {
  /** 默认背包容量 */
  defaultMaxInventory: 20,
  
  /** 最近创作最大数量 */
  maxRecentCreations: 5,
  
  /** 背包扩容价格（每次扩容5格） */
  expansionCost: 100,
  
  /** 每次扩容增加的格数 */
  expansionSlots: 5,
} as const;

// ============================================================================
// 商店系统配置
// ============================================================================

export const ShopConfig = {
  /** 默认上架槽位数 */
  defaultMaxListings: 5,
  
  /** 等级价格乘数 */
  gradeMultipliers: {
    SSS: 15,
    SS: 10,
    S: 7,
    A: 5,
    B: 3,
    C: 1,
  } as const,
  
  /** 系统收购折扣率 */
  systemBuyDiscount: 0.5,
  
  /** 商店主题列表 */
  themes: ['traditional', 'modern', 'zen', 'vintage', 'fantasy'] as const,
} as const;

// ============================================================================
// 玩家默认配置
// ============================================================================

export const PlayerDefaults = {
  /** 默认染坊名称 */
  dyeHouseName: '无名染坊',
  
  /** 初始货币 */
  initialCurrency: 100,
  
  /** 初始等级 */
  initialLevel: 1,
  
  /** 初始经验 */
  initialExp: 0,
} as const;

// ============================================================================
// 类型导出
// ============================================================================

export type ScoreGrade = keyof typeof ScoreConfig.gradeRewards;
export type ShopTheme = typeof ShopConfig.themes[number];


// ============================================================================
// 道具商城配置
// ============================================================================

import type { ShopItem } from '@/types/items.types'

export const ItemShopConfig = {
  /** 商店道具列表 */
  items: [
    {
      id: 'lucky_dye',
      name: '幸运染料',
      description: '使用后下次评分有10%概率提升一个等级',
      icon: '🍀',
      price: 50,
      type: 'consumable',
      effect: 'score_boost'
    },
    {
      id: 'golden_frame',
      name: '金色画框',
      description: '为作品添加金色边框，提升展示效果',
      icon: '🖼️',
      price: 100,
      type: 'permanent',
      effect: 'frame_gold'
    },
    {
      id: 'silver_frame',
      name: '银色画框',
      description: '为作品添加银色边框，简约大方',
      icon: '🪞',
      price: 60,
      type: 'permanent',
      effect: 'frame_silver'
    },
    {
      id: 'vip_badge',
      name: 'VIP徽章',
      description: '商店名称旁显示VIP标识，彰显身份',
      icon: '⭐',
      price: 500,
      type: 'permanent',
      effect: 'vip_badge'
    },
    {
      id: 'extra_recent',
      name: '最近创作+1',
      description: '永久增加1个最近创作槽位',
      icon: '📦',
      price: 200,
      type: 'permanent',
      effect: 'recent_slot'
    },
    {
      id: 'exp_potion',
      name: '经验药水',
      description: '使用后获得50点经验值',
      icon: '🧪',
      price: 30,
      type: 'consumable',
      effect: 'exp_boost'
    }
  ] as ShopItem[],
} as const

/**
 * 根据ID获取道具
 */
export function getItemById(itemId: string): ShopItem | undefined {
  return ItemShopConfig.items.find(item => item.id === itemId)
}
