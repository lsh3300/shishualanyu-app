# 蓝染·漂流记 - 游戏化技术实现方案
## Game Redesign: Technical Implementation Plan

**创建时间**: 2025-11-30  
**基于**: GAME_REDESIGN_ANALYSIS.md

---

## 🎯 实现优先级

### MVP核心功能（必须实现）

```
第一优先级（P0）- 建立游戏感:
✅ 染坊大厅（Hub场景）
✅ 材料系统（收集+使用）
✅ 评分机制（量化反馈）
✅ 等级系统（进度可视化）
✅ 任务系统（明确目标）

第二优先级（P1）- 核心循环:
✅ 创作工坊（任务模式）
✅ 漂流河2.0（物理交互）
✅ 成就系统（额外目标）
✅ 图鉴系统（收集动力）

第三优先级（P2）- 深度内容:
✅ 材料市集（社交）
✅ 排行榜（竞技）
✅ 挑战赛（限时活动）
```

---

## 📐 数据库结构重新设计

### 新增表结构

#### 1. `materials` 表（材料库）

```sql
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 基础信息
  name TEXT NOT NULL, -- "缥色染料"、"云纹图案"
  type TEXT NOT NULL, -- 'dye' | 'pattern' | 'technique'
  
  -- 分类与属性
  category TEXT, -- 染料: 'blue' | 'indigo'; 纹样: 'nature' | 'geometry'
  rarity INT DEFAULT 1, -- 稀有度 1-5星
  
  -- 游戏属性
  unlock_level INT DEFAULT 1, -- 解锁等级
  unlock_type TEXT, -- 'level' | 'achievement' | 'quest' | 'purchase'
  unlock_requirement JSONB, -- 解锁条件详情
  
  -- 使用属性
  color_hsl JSONB, -- 染料: {h: 210, s: 60, l: 50}
  pattern_svg TEXT, -- 纹样: SVG路径数据
  effect_type TEXT, -- 技法: 'tie' | 'wax' | 'board'
  
  -- 展示信息
  description TEXT, -- 描述
  icon_url TEXT, -- 图标
  preview_url TEXT, -- 预览图
  
  -- 获取方式
  obtainable_from JSONB, -- [{type: 'quest', id: 'xxx'}, {type: 'shop'}]
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_materials_type ON materials(type);
CREATE INDEX idx_materials_rarity ON materials(rarity);
CREATE INDEX idx_materials_unlock_level ON materials(unlock_level);
```

#### 2. `player_materials` 表（玩家拥有的材料）

```sql
CREATE TABLE player_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  material_id UUID REFERENCES materials(id),
  
  -- 拥有状态
  owned BOOLEAN DEFAULT TRUE,
  quantity INT DEFAULT 1, -- 如果材料可叠加
  
  -- 获取信息
  obtained_at TIMESTAMPTZ DEFAULT NOW(),
  obtained_from TEXT, -- 'quest' | 'shop' | 'achievement' | 'gift'
  
  -- 统计数据
  times_used INT DEFAULT 0,
  
  UNIQUE(user_id, material_id)
);

CREATE INDEX idx_player_materials_user ON player_materials(user_id);
CREATE INDEX idx_player_materials_owned ON player_materials(user_id, owned);
```

#### 3. `player_profile` 表（玩家档案扩展）

```sql
CREATE TABLE player_profile (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  
  -- 基础信息
  dye_house_name TEXT, -- 染坊名称
  level INT DEFAULT 1,
  exp INT DEFAULT 0,
  exp_to_next_level INT DEFAULT 100,
  
  -- 货币
  currency INT DEFAULT 0, -- 蓝草币
  premium_currency INT DEFAULT 0, -- 高级货币（可选）
  
  -- 统计数据
  cloths_created INT DEFAULT 0,
  cloths_dyed INT DEFAULT 0,
  cloths_completed INT DEFAULT 0,
  materials_collected INT DEFAULT 0,
  achievements_unlocked INT DEFAULT 0,
  
  -- 社交数据
  reputation_points INT DEFAULT 0, -- 声望值
  collaboration_count INT DEFAULT 0,
  market_transactions INT DEFAULT 0,
  
  -- 偏好设置
  favorite_materials JSONB DEFAULT '[]',
  custom_seal JSONB, -- 自定义印章配置
  
  -- 时间统计
  total_play_time INT DEFAULT 0, -- 秒
  last_daily_claim TIMESTAMPTZ, -- 上次领取每日奖励
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 等级经验配置表（可以直接在代码中配置）
-- Level 1: 0-100 exp
-- Level 2: 100-250 exp (需要150)
// Level 3: 250-450 exp (需要200)
// 公式: exp_to_next = base * (level ^ 1.5)
```

#### 4. `quests` 表（任务系统）

```sql
CREATE TABLE quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 基础信息
  title TEXT NOT NULL,
  description TEXT,
  quest_type TEXT NOT NULL, -- 'daily' | 'weekly' | 'main' | 'side' | 'achievement'
  
  -- NPC信息
  npc_name TEXT, -- "老染匠"、"布商张婆婆"
  npc_avatar_url TEXT,
  npc_dialogue TEXT, -- NPC对话内容
  
  -- 任务要求（JSON格式）
  requirements JSONB,
  /* 示例:
  {
    "type": "create_cloth",
    "conditions": {
      "color_hsl": {"h": [200, 220], "s": [50, 80], "l": [40, 60]},
      "patterns": ["cloud"],
      "min_score": 80,
      "time_limit": 300 // 秒
    }
  }
  或
  {
    "type": "collect_materials",
    "target": ["material_id_1", "material_id_2"],
    "quantity": 3
  }
  */
  
  -- 奖励
  rewards JSONB,
  /* 示例:
  {
    "exp": 100,
    "currency": 50,
    "materials": [{"id": "xxx", "quantity": 1}],
    "unlock_materials": ["material_id"],
    "achievements": ["achievement_id"]
  }
  */
  
  -- 可用性
  required_level INT DEFAULT 1,
  is_repeatable BOOLEAN DEFAULT FALSE,
  cooldown_hours INT, -- 可重复任务的冷却时间
  
  -- 限时活动
  active_from TIMESTAMPTZ,
  active_until TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quests_type ON quests(quest_type);
CREATE INDEX idx_quests_active ON quests(active_from, active_until);
```

#### 5. `player_quests` 表（玩家任务进度）

```sql
CREATE TABLE player_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  quest_id UUID REFERENCES quests(id),
  
  -- 状态
  status TEXT DEFAULT 'available', -- 'available' | 'in_progress' | 'completed' | 'claimed'
  
  -- 进度
  progress JSONB DEFAULT '{}',
  /* 示例:
  {
    "current": 2,
    "total": 5
  }
  */
  
  -- 时间
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  claimed_at TIMESTAMPTZ,
  
  -- 评分（如果任务有评分）
  score INT,
  
  UNIQUE(user_id, quest_id)
);

CREATE INDEX idx_player_quests_user ON player_quests(user_id);
CREATE INDEX idx_player_quests_status ON player_quests(user_id, status);
```

#### 6. `achievements` 表（成就系统）

```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 基础信息
  title TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'collection' | 'creation' | 'social' | 'exploration' | 'challenge'
  
  -- 图标与展示
  icon_url TEXT,
  badge_color TEXT, -- 徽章颜色
  
  -- 解锁条件
  unlock_condition JSONB,
  /* 示例:
  {
    "type": "collect_materials",
    "count": 50
  }
  或
  {
    "type": "create_cloths",
    "count": 100,
    "min_score": 90
  }
  */
  
  -- 奖励
  rewards JSONB,
  
  -- 稀有度
  rarity INT DEFAULT 1, -- 1-5
  
  -- 隐藏成就
  is_hidden BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_achievements_category ON achievements(category);
```

#### 7. `player_achievements` 表（玩家成就）

```sql
CREATE TABLE player_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  achievement_id UUID REFERENCES achievements(id),
  
  -- 解锁状态
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 进度（用于追踪）
  progress INT DEFAULT 0,
  total_required INT,
  
  -- 展示
  is_showcased BOOLEAN DEFAULT FALSE, -- 是否在个人资料中展示
  
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_player_achievements_user ON player_achievements(user_id);
```

#### 8. `cloth_scores` 表（作品评分记录）

```sql
CREATE TABLE cloth_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cloth_id UUID REFERENCES cloths(id),
  user_id UUID REFERENCES auth.users(id),
  
  -- 评分维度
  color_score INT, -- 0-100
  pattern_score INT, -- 0-100
  creativity_score INT, -- 0-100
  technique_score INT, -- 0-100
  total_score INT, -- 总分
  
  -- 评分等级
  grade TEXT, -- 'SSS' | 'SS' | 'S' | 'A' | 'B'
  
  -- 奖励记录
  rewards_given JSONB,
  
  -- 关联任务
  quest_id UUID REFERENCES quests(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cloth_scores_user ON cloth_scores(user_id);
CREATE INDEX idx_cloth_scores_grade ON cloth_scores(grade);
```

---

## 🎨 前端组件架构

### 新增组件结构

```
app/
├── game/                          # 游戏模块
│   ├── layout.tsx                 # 游戏专用布局
│   │
│   ├── hub/                       # 染坊大厅（主界面）
│   │   ├── page.tsx
│   │   └── components/
│   │       ├── DyeHouseView.tsx   # 2.5D染坊场景
│   │       ├── MaterialButton.tsx # 材料库按钮
│   │       ├── WorkbenchButton.tsx# 工作台按钮
│   │       ├── QuestBoard.tsx     # 任务板
│   │       ├── PlayerStats.tsx    # 玩家统计
│   │       └── DailyRewards.tsx   # 每日奖励弹窗
│   │
│   ├── workshop/                  # 创作工坊
│   │   ├── free/page.tsx          # 自由创作模式
│   │   ├── quest/[id]/page.tsx    # 任务创作模式
│   │   ├── challenge/page.tsx     # 挑战模式
│   │   └── components/
│   │       ├── WorkshopCanvas.tsx # Canvas画布（重构）
│   │       ├── MaterialSelector.tsx# 材料选择器
│   │       ├── ScorePreview.tsx   # 实时评分预览
│   │       ├── TimerWidget.tsx    # 计时器
│   │       └── QuestRequirements.tsx# 任务要求显示
│   │
│   ├── river/                     # 漂流河（重构）
│   │   ├── page.tsx
│   │   └── components/
│   │       ├── RiverScene.tsx     # 3D滚动场景
│   │       ├── FloatingCloth.tsx  # 漂浮的布料
│   │       ├── PlayerBoat.tsx     # 玩家小船
│   │       ├── CatchMechanic.tsx  # 捞取机制
│   │       └── RarityIndicator.tsx# 稀有度指示
│   │
│   ├── collection/                # 收集图鉴
│   │   ├── materials/page.tsx     # 材料图鉴
│   │   ├── cloths/page.tsx        # 作品图鉴
│   │   ├── achievements/page.tsx  # 成就图鉴
│   │   └── components/
│   │       ├── MaterialCard.tsx   # 材料卡片
│   │       ├── CollectionGrid.tsx # 图鉴网格
│   │       └── ProgressStats.tsx  # 收集进度
│   │
│   ├── market/                    # 材料市集
│   │   ├── page.tsx
│   │   └── components/
│   │       ├── MarketStall.tsx    # 摊位
│   │       ├── ItemListing.tsx    # 商品列表
│   │       ├── PurchaseDialog.tsx # 购买对话框
│   │       └── PlayerShop.tsx     # 玩家商店
│   │
│   ├── ranking/                   # 排行榜
│   │   ├── page.tsx
│   │   └── components/
│   │       ├── LeaderboardList.tsx# 排行列表
│   │       ├── PlayerRankCard.tsx # 玩家排名卡片
│   │       └── SeasonInfo.tsx     # 赛季信息
│   │
│   └── profile/                   # 个人档案
│       ├── [userId]/page.tsx
│       └── components/
│           ├── ProfileHeader.tsx  # 档案头部
│           ├── StatsDisplay.tsx   # 统计展示
│           ├── AchievementShowcase.tsx# 成就展示
│           └── ClothGallery.tsx   # 作品画廊

components/
├── game/
│   ├── core/                      # 核心游戏组件
│   │   ├── LevelProgress.tsx      # 等级进度条
│   │   ├── CurrencyDisplay.tsx    # 货币显示
│   │   ├── ExpGainAnimation.tsx   # 经验获得动画
│   │   ├── QuestTracker.tsx       # 任务追踪器
│   │   └── NotificationToast.tsx  # 通知提示
│   │
│   ├── materials/                 # 材料系统组件
│   │   ├── MaterialIcon.tsx       # 材料图标
│   │   ├── MaterialTooltip.tsx    # 材料提示
│   │   ├── RarityBadge.tsx        # 稀有度徽章
│   │   └── UnlockAnimation.tsx    # 解锁动画
│   │
│   ├── scoring/                   # 评分系统组件
│   │   ├── ScoreCalculator.ts     # 评分计算逻辑
│   │   ├── ScoreDisplay.tsx       # 分数显示
│   │   ├── GradeIndicator.tsx     # 等级指示器
│   │   └── RewardPreview.tsx      # 奖励预览
│   │
│   └── ui/                        # 游戏UI组件
│       ├── GameButton.tsx         # 游戏按钮（统一样式）
│       ├── GameDialog.tsx         # 游戏对话框
│       ├── GameCard.tsx           # 游戏卡片
│       ├── ProgressBar.tsx        # 进度条
│       └── LoadingSpinner.tsx     # 加载动画

lib/
├── game/
│   ├── scoring/
│   │   ├── color-matcher.ts       # 颜色匹配算法
│   │   ├── pattern-analyzer.ts    # 纹样分析
│   │   ├── creativity-evaluator.ts# 创意评估
│   │   └── score-calculator.ts    # 总分计算
│   │
│   ├── progression/
│   │   ├── level-system.ts        # 等级系统逻辑
│   │   ├── achievement-checker.ts # 成就检查
│   │   └── quest-validator.ts     # 任务验证
│   │
│   ├── economy/
│   │   ├── currency-manager.ts    # 货币管理
│   │   ├── reward-distributor.ts  # 奖励分发
│   │   └── shop-pricing.ts        # 商店定价
│   │
│   └── social/
│       ├── collaboration-matcher.ts# 协作匹配
│       ├── ranking-calculator.ts  # 排名计算
│       └── reputation-system.ts   # 声望系统

hooks/
└── game/
    ├── use-player-profile.ts      # 玩家档案Hook
    ├── use-materials.ts           # 材料系统Hook
    ├── use-quests.ts              # 任务系统Hook
    ├── use-achievements.ts        # 成就系统Hook
    ├── use-scoring.ts             # 评分系统Hook
    └── use-market.ts              # 市场系统Hook
```

---

## 🎯 核心系统实现细节

### 1. 评分系统实现

#### 颜色匹配算法

```typescript
// lib/game/scoring/color-matcher.ts

/**
 * 计算两个HSL颜色的差异
 */
export function calculateColorDifference(
  target: { h: number; s: number; l: number },
  actual: { h: number; s: number; l: number }
): number {
  // 色相差异（环形，0-180度）
  const hueDiff = Math.min(
    Math.abs(target.h - actual.h),
    360 - Math.abs(target.h - actual.h)
  )
  
  // 饱和度差异（0-100%）
  const saturationDiff = Math.abs(target.s - actual.s)
  
  // 亮度差异（0-100%）
  const lightnessDiff = Math.abs(target.l - actual.l)
  
  // 加权计算（色相最重要）
  const score = 100 - (
    (hueDiff / 180) * 40 +  // 色相权重40%
    (saturationDiff / 100) * 30 +  // 饱和度权重30%
    (lightnessDiff / 100) * 30     // 亮度权重30%
  ) * 100
  
  return Math.max(0, Math.min(100, score))
}

/**
 * 检查颜色是否在目标范围内
 */
export function isColorInRange(
  color: { h: number; s: number; l: number },
  range: {
    h: [number, number],
    s: [number, number],
    l: [number, number]
  }
): boolean {
  const inHueRange = color.h >= range.h[0] && color.h <= range.h[1]
  const inSatRange = color.s >= range.s[0] && color.s <= range.s[1]
  const inLightRange = color.l >= range.l[0] && color.l <= range.l[1]
  
  return inHueRange && inSatRange && inLightRange
}
```

#### 纹样复杂度分析

```typescript
// lib/game/scoring/pattern-analyzer.ts

interface Layer {
  textureId: string
  params: {
    opacity: number
    scale: number
    rotation?: number
  }
  dyeDepth: number
}

/**
 * 计算纹样复杂度分数
 */
export function calculatePatternComplexity(layers: Layer[]): number {
  // 基础分：图层数量（1-5层）
  const layerScore = Math.min(layers.length / 5, 1) * 30
  
  // 覆盖率分：综合不透明度
  const totalOpacity = layers.reduce((sum, layer) => 
    sum + layer.params.opacity * (1 - layer.dyeDepth), 0
  )
  const coverageScore = Math.min(totalOpacity / 3, 1) * 30
  
  // 技法分：使用的纹样种类
  const uniqueTextures = new Set(layers.map(l => l.textureId)).size
  const varietyScore = Math.min(uniqueTextures / 3, 1) * 20
  
  // 精细度分：参数调整的复杂性
  const adjustmentScore = layers.reduce((sum, layer) => {
    let score = 0
    if (layer.params.scale !== 1) score += 5
    if (layer.params.rotation && layer.params.rotation !== 0) score += 5
    return sum + score
  }, 0)
  const fineTuneScore = Math.min(adjustmentScore / layers.length / 10, 1) * 20
  
  return Math.round(layerScore + coverageScore + varietyScore + fineTuneScore)
}
```

#### 创意指数计算

```typescript
// lib/game/scoring/creativity-evaluator.ts

/**
 * 计算创意指数（与现有作品的差异度）
 */
export async function calculateCreativityScore(
  layers: Layer[],
  userId: string
): Promise<number> {
  // 获取最近100件作品
  const recentWorks = await supabase
    .from('cloths')
    .select('layers')
    .order('created_at', { ascending: false })
    .limit(100)
  
  if (recentWorks.data.length === 0) {
    return 100 // 如果没有对比对象，给满分
  }
  
  // 计算与每件作品的相似度
  const similarities = recentWorks.data.map(work => 
    calculateLayerSimilarity(layers, work.layers)
  )
  
  // 取平均相似度
  const avgSimilarity = similarities.reduce((a, b) => a + b, 0) / similarities.length
  
  // 差异度 = 100 - 相似度
  return Math.round(100 - avgSimilarity)
}

/**
 * 计算两组图层的相似度
 */
function calculateLayerSimilarity(layers1: Layer[], layers2: Layer[]): number {
  // 简化算法：比较纹样组合
  const textures1 = layers1.map(l => l.textureId).sort().join(',')
  const textures2 = layers2.map(l => l.textureId).sort().join(',')
  
  if (textures1 === textures2) {
    return 80 // 纹样完全相同，高相似度
  }
  
  // 计算共同纹样比例
  const set1 = new Set(layers1.map(l => l.textureId))
  const set2 = new Set(layers2.map(l => l.textureId))
  const intersection = new Set([...set1].filter(x => set2.has(x)))
  
  const similarityRatio = intersection.size / Math.max(set1.size, set2.size)
  
  return Math.round(similarityRatio * 70)
}
```

### 2. 等级系统实现

```typescript
// lib/game/progression/level-system.ts

/**
 * 等级配置
 */
const LEVEL_CONFIG = {
  baseExp: 100, // 1级到2级所需经验
  exponent: 1.5, // 经验增长指数
  maxLevel: 50, // 最大等级
}

/**
 * 计算升级所需经验
 */
export function calculateExpForLevel(level: number): number {
  if (level <= 1) return 0
  return Math.floor(LEVEL_CONFIG.baseExp * Math.pow(level - 1, LEVEL_CONFIG.exponent))
}

/**
 * 计算总经验到等级的转换
 */
export function calculateLevelFromExp(totalExp: number): {
  level: number
  currentLevelExp: number
  expToNextLevel: number
  progress: number
} {
  let level = 1
  let expAccumulated = 0
  
  while (level < LEVEL_CONFIG.maxLevel) {
    const expForNext = calculateExpForLevel(level + 1)
    if (expAccumulated + expForNext > totalExp) {
      break
    }
    expAccumulated += expForNext
    level++
  }
  
  const currentLevelExp = totalExp - expAccumulated
  const expToNextLevel = calculateExpForLevel(level + 1)
  const progress = expToNextLevel > 0 ? currentLevelExp / expToNextLevel : 1
  
  return {
    level,
    currentLevelExp,
    expToNextLevel,
    progress
  }
}

/**
 * 添加经验值并返回是否升级
 */
export async function addExperience(
  userId: string,
  expGain: number
): Promise<{
  leveledUp: boolean
  oldLevel: number
  newLevel: number
  rewards?: any[]
}> {
  // 获取当前档案
  const { data: profile } = await supabase
    .from('player_profile')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  const oldTotalExp = profile.exp
  const newTotalExp = oldTotalExp + expGain
  
  const oldLevelInfo = calculateLevelFromExp(oldTotalExp)
  const newLevelInfo = calculateLevelFromExp(newTotalExp)
  
  const leveledUp = newLevelInfo.level > oldLevelInfo.level
  
  // 更新数据库
  await supabase
    .from('player_profile')
    .update({
      exp: newTotalExp,
      level: newLevelInfo.level,
      exp_to_next_level: newLevelInfo.expToNextLevel,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
  
  // 如果升级，检查解锁内容
  let rewards = []
  if (leveledUp) {
    rewards = await checkLevelUpRewards(userId, newLevelInfo.level)
  }
  
  return {
    leveledUp,
    oldLevel: oldLevelInfo.level,
    newLevel: newLevelInfo.level,
    rewards
  }
}

/**
 * 检查升级奖励
 */
async function checkLevelUpRewards(userId: string, newLevel: number): Promise<any[]> {
  const rewards = []
  
  // 解锁新材料
  const { data: unlockedMaterials } = await supabase
    .from('materials')
    .select('*')
    .eq('unlock_type', 'level')
    .eq('unlock_level', newLevel)
  
  if (unlockedMaterials) {
    for (const material of unlockedMaterials) {
      await supabase.from('player_materials').insert({
        user_id: userId,
        material_id: material.id,
        obtained_from: 'level_up'
      })
      
      rewards.push({
        type: 'material',
        data: material
      })
    }
  }
  
  // 货币奖励
  const currencyReward = newLevel * 50
  await supabase.rpc('add_currency', {
    p_user_id: userId,
    p_amount: currencyReward
  })
  
  rewards.push({
    type: 'currency',
    amount: currencyReward
  })
  
  return rewards
}
```

### 3. 任务系统实现

```typescript
// lib/game/progression/quest-validator.ts

/**
 * 验证任务完成情况
 */
export async function validateQuestCompletion(
  questId: string,
  userId: string,
  clothData: {
    layers: Layer[]
    score: {
      color: number
      pattern: number
      creativity: number
      technique: number
      total: number
    }
  }
): Promise<{
  completed: boolean
  message: string
  rewards?: any
}> {
  // 获取任务要求
  const { data: quest } = await supabase
    .from('quests')
    .select('*')
    .eq('id', questId)
    .single()
  
  if (!quest) {
    return { completed: false, message: '任务不存在' }
  }
  
  const requirements = quest.requirements
  
  // 根据任务类型验证
  switch (requirements.type) {
    case 'create_cloth':
      return validateCreateClothQuest(requirements, clothData)
    
    case 'collect_materials':
      return await validateCollectMaterialsQuest(requirements, userId)
    
    case 'score_threshold':
      return validateScoreThresholdQuest(requirements, clothData.score)
    
    default:
      return { completed: false, message: '未知任务类型' }
  }
}

/**
 * 验证"创作布料"类任务
 */
function validateCreateClothQuest(
  requirements: any,
  clothData: any
): { completed: boolean; message: string } {
  const { conditions } = requirements
  
  // 检查颜色范围
  if (conditions.color_hsl) {
    const avgColor = calculateAverageColor(clothData.layers)
    if (!isColorInRange(avgColor, conditions.color_hsl)) {
      return {
        completed: false,
        message: '颜色不符合要求'
      }
    }
  }
  
  // 检查必须包含的纹样
  if (conditions.patterns && conditions.patterns.length > 0) {
    const usedPatterns = clothData.layers.map(l => l.textureId)
    const hasAllPatterns = conditions.patterns.every(p => 
      usedPatterns.includes(p)
    )
    
    if (!hasAllPatterns) {
      return {
        completed: false,
        message: '缺少必需的纹样'
      }
    }
  }
  
  // 检查最低分数
  if (conditions.min_score && clothData.score.total < conditions.min_score) {
    return {
      completed: false,
      message: `分数不够（${clothData.score.total}/${conditions.min_score}）`
    }
  }
  
  return {
    completed: true,
    message: '任务完成！'
  }
}

/**
 * 发放任务奖励
 */
export async function distributeQuestRewards(
  questId: string,
  userId: string
): Promise<void> {
  const { data: quest } = await supabase
    .from('quests')
    .select('rewards')
    .eq('id', questId)
    .single()
  
  if (!quest || !quest.rewards) return
  
  const rewards = quest.rewards
  
  // 经验奖励
  if (rewards.exp) {
    await addExperience(userId, rewards.exp)
  }
  
  // 货币奖励
  if (rewards.currency) {
    await supabase.rpc('add_currency', {
      p_user_id: userId,
      p_amount: rewards.currency
    })
  }
  
  // 材料奖励
  if (rewards.materials) {
    for (const material of rewards.materials) {
      await supabase.from('player_materials').upsert({
        user_id: userId,
        material_id: material.id,
        quantity: material.quantity,
        obtained_from: 'quest'
      })
    }
  }
  
  // 更新任务状态
  await supabase
    .from('player_quests')
    .update({
      status: 'claimed',
      claimed_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .eq('quest_id', questId)
}
```

---

## 🚀 第一阶段实施计划

### Week 1-2: 基础系统搭建

**目标**: 让玩家能体验到"游戏循环"

#### Day 1-3: 数据库与API
```
✅ 创建所有新表
✅ 编写RLS策略
✅ 实现基础API:
   - GET /api/game/profile - 获取玩家档案
   - POST /api/game/exp - 添加经验
   - GET /api/game/materials - 获取材料列表
   - POST /api/game/materials/use - 使用材料
```

#### Day 4-7: 染坊大厅
```
✅ 创建Hub页面UI
✅ 实现等级进度显示
✅ 实现货币显示
✅ 实现每日签到
✅ 实现快捷导航
```

#### Day 8-10: 材料系统
```
✅ 材料图鉴页面
✅ 材料卡片组件
✅ 稀有度展示
✅ 解锁动画
```

#### Day 11-14: 评分系统
```
✅ 实现评分算法
✅ 创作完成时显示评分
✅ 根据评分发放奖励
✅ 评分动画效果
```

### Week 3-4: 核心玩法

#### Day 15-18: 任务系统
```
✅ 任务列表UI
✅ 任务详情页
✅ 任务验证逻辑
✅ 奖励发放系统
```

#### Day 19-21: 工坊重构
```
✅ 任务创作模式
✅ 材料选择限制
✅ 实时评分预览
✅ 完成动画
```

#### Day 22-24: 成就系统
```
✅ 成就检查逻辑
✅ 成就解锁通知
✅ 成就展示页面
```

#### Day 25-28: 测试与打磨
```
✅ 整体流程测试
✅ 数值平衡调整
✅ UI/UX优化
✅ 性能优化
```

---

**文档状态**: 技术方案v1.0  
**下一步**: 等待反馈，准备开发
