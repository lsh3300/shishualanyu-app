# Design Document: Game System Enhancement

## Overview

本设计文档描述了"蓝染·漂流记"游戏系统的修复和完善方案。主要目标是：
1. 修复评分系统的硬编码问题
2. 隔离测试代码与生产代码
3. 完善玩家档案、背包、商店等核心系统
4. 改善错误处理和用户体验
5. 确保数据库结构正确初始化

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                        │
├─────────────────────────────────────────────────────────────────┤
│  Pages                    │  Components                          │
│  ├── /game/hub           │  ├── game/canvas/IndigoCanvas        │
│  ├── /game/workshop      │  ├── game/scoring/ScoreResultDialog  │
│  ├── /game/inventory     │  ├── game/core/PlayerStatsCard       │
│  └── /game/shop          │  └── game/shop/ShopScene             │
├─────────────────────────────────────────────────────────────────┤
│                        Hooks Layer                               │
│  ├── use-player-profile.ts  (玩家档案管理)                       │
│  ├── use-submit-score.ts    (评分提交)                           │
│  └── use-inventory.ts       (背包管理)                           │
├─────────────────────────────────────────────────────────────────┤
│                        API Routes                                │
│  ├── /api/game/score        (评分API)                           │
│  ├── /api/inventory         (背包API)                           │
│  └── /api/listings          (上架API)                           │
├─────────────────────────────────────────────────────────────────┤
│                        Services Layer                            │
│  ├── lib/game/scoring/score-calculator.ts                       │
│  ├── lib/services/shopService.ts                                │
│  └── lib/services/rewardService.ts                              │
├─────────────────────────────────────────────────────────────────┤
│                        Database (Supabase)                       │
│  ├── player_profile    │  ├── cloths                            │
│  ├── cloth_scores      │  ├── user_inventory                    │
│  └── user_shops        │  └── shop_listings                     │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. 评分系统重构

#### ScoreCalculator 接口
```typescript
interface ScoreCalculator {
  // 计算颜色分数 - 基于图层染色深度分布
  calculateColorScore(layers: ClothLayer[]): number;
  
  // 计算纹样分数 - 基于图层复杂度
  calculatePatternScore(layers: ClothLayer[]): number;
  
  // 计算创意分数 - 基于参数变化丰富度
  calculateCreativityScore(layers: ClothLayer[]): number;
  
  // 计算技法分数 - 基于图层叠加技巧
  calculateTechniqueScore(layers: ClothLayer[]): number;
  
  // 综合评分
  scoreCloth(layers: ClothLayer[]): ClothScoreResult;
}

interface ClothScoreResult {
  dimensions: ScoreDimensions;
  total: number;
  grade: ScoreGrade;
}
```

#### 颜色分数计算算法
```typescript
// 新的颜色分数计算逻辑
function calculateColorScore(layers: ClothLayer[]): number {
  if (layers.length === 0) return 0;
  
  // 1. 计算染色深度分布 (30分)
  const dyeDepths = layers.map(l => l.dyeDepth);
  const avgDepth = dyeDepths.reduce((a, b) => a + b, 0) / dyeDepths.length;
  const depthScore = avgDepth * 30; // 0-30分
  
  // 2. 计算深度变化丰富度 (30分)
  const depthVariance = calculateVariance(dyeDepths);
  const varianceScore = Math.min(depthVariance * 100, 30); // 0-30分
  
  // 3. 计算颜色和谐度 (40分)
  // 蓝染最佳深度范围: 0.4-0.8
  const harmonyScore = layers.reduce((score, layer) => {
    const inOptimalRange = layer.dyeDepth >= 0.4 && layer.dyeDepth <= 0.8;
    return score + (inOptimalRange ? 40 / layers.length : 20 / layers.length);
  }, 0);
  
  return Math.round(depthScore + varianceScore + harmonyScore);
}
```

### 2. 测试模式隔离

#### 环境配置
```typescript
// lib/game/config.ts
export const GameConfig = {
  isProduction: process.env.NODE_ENV === 'production',
  allowTestMode: process.env.NODE_ENV === 'development',
  testModeHeader: 'X-Game-Test-Mode',
};
```

#### API 中间件
```typescript
// lib/game/middleware/auth.ts
export async function requireAuth(request: NextRequest) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    // 检查是否为开发环境的测试模式
    if (GameConfig.allowTestMode && 
        request.headers.get(GameConfig.testModeHeader) === 'true') {
      return { 
        user: null, 
        isTestMode: true,
        testUserId: 'test-user-' + Date.now()
      };
    }
    
    throw new AuthError('未登录', 401);
  }
  
  return { user, isTestMode: false };
}
```

### 3. 玩家档案系统

#### 档案自动创建流程
```
用户首次访问游戏
       ↓
检查 player_profile 表
       ↓
    存在? ──否──→ 创建默认档案
       │              ↓
       是         设置初始值:
       │          - level: 1
       ↓          - exp: 0
   返回档案       - currency: 100
                  - dye_house_name: "无名染坊"
```

#### 经验值和升级计算
```typescript
// 升级所需经验公式: baseExp * level^exponent
const LEVEL_CONFIG = {
  baseExp: 100,
  exponent: 1.5,
  maxLevel: 100
};

function getExpForLevel(level: number): number {
  return Math.floor(LEVEL_CONFIG.baseExp * Math.pow(level, LEVEL_CONFIG.exponent));
}

function calculateLevelFromExp(totalExp: number): LevelInfo {
  let level = 1;
  let expAccumulated = 0;
  
  while (level < LEVEL_CONFIG.maxLevel) {
    const expForNext = getExpForLevel(level);
    if (expAccumulated + expForNext > totalExp) break;
    expAccumulated += expForNext;
    level++;
  }
  
  return {
    level,
    currentLevelExp: totalExp - expAccumulated,
    expToNextLevel: getExpForLevel(level),
    progress: (totalExp - expAccumulated) / getExpForLevel(level)
  };
}
```

### 4. 背包系统

#### 数据模型
```typescript
interface InventoryItem {
  id: string;
  user_id: string;
  cloth_id: string;
  slot_type: 'inventory' | 'recent';
  added_at: string;
  sort_order: number;
  cloth?: ClothData; // 关联的作品数据
}

interface InventoryCapacity {
  current: number;
  max: number;
  recentCount: number;
  maxRecent: 5; // 最近创作固定5个
}
```

#### 保存流程
```
用户完成创作
      ↓
调用 /api/inventory/save-recent
      ↓
检查最近创作数量
      ↓
  >= 5? ──是──→ 删除最旧的一个
      │
      否
      ↓
插入新记录 (slot_type: 'recent')
      ↓
更新 cloths 表状态
```

### 5. 商店系统

#### 上架流程
```
用户选择作品上架
       ↓
检查作品状态 (必须在背包中)
       ↓
计算建议价格 = total_score * grade_multiplier
       ↓
用户确认价格
       ↓
创建 shop_listings 记录
       ↓
更新 cloths.status = 'listed'
       ↓
从 user_inventory 移除
```

#### 价格计算
```typescript
const GRADE_MULTIPLIERS = {
  SSS: 15,
  SS: 10,
  S: 7,
  A: 5,
  B: 3,
  C: 1
};

function calculateSuggestedPrice(totalScore: number, grade: ScoreGrade): number {
  return Math.round(totalScore * GRADE_MULTIPLIERS[grade]);
}
```

## Data Models

### 核心表结构

```sql
-- 玩家档案表
CREATE TABLE player_profile (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  dye_house_name TEXT DEFAULT '无名染坊',
  level INT DEFAULT 1,
  exp INT DEFAULT 0,
  currency INT DEFAULT 100,
  total_cloths_created INT DEFAULT 0,
  total_score BIGINT DEFAULT 0,
  highest_score INT DEFAULT 0,
  shop_id UUID, -- 关联商店
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 作品表
CREATE TABLE cloths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id),
  layers JSONB NOT NULL DEFAULT '[]',
  status TEXT DEFAULT 'draft', -- draft/in_inventory/listed/sold
  layer_count INT DEFAULT 0,
  is_recent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 评分记录表
CREATE TABLE cloth_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cloth_id UUID REFERENCES cloths(id),
  user_id UUID REFERENCES auth.users(id),
  color_score INT CHECK (color_score >= 0 AND color_score <= 100),
  pattern_score INT CHECK (pattern_score >= 0 AND pattern_score <= 100),
  creativity_score INT CHECK (creativity_score >= 0 AND creativity_score <= 100),
  technique_score INT CHECK (technique_score >= 0 AND technique_score <= 100),
  total_score INT,
  grade TEXT CHECK (grade IN ('C', 'B', 'A', 'S', 'SS', 'SSS')),
  exp_reward INT,
  currency_reward INT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: 颜色分数动态计算
*For any* 图层数组，评分系统计算的颜色分数应该基于图层的染色深度数据变化，而非返回固定值。
**Validates: Requirements 1.1**

### Property 2: 分数范围约束
*For any* 图层输入，评分系统返回的四个维度分数（颜色、纹样、创意、技法）都应该在0-100范围内。
**Validates: Requirements 1.3**

### Property 3: 等级映射正确性
*For any* 总分值，评分系统应该正确映射到对应等级：C(<60), B(60-69), A(70-79), S(80-89), SS(90-94), SSS(>=95)。
**Validates: Requirements 1.4**

### Property 4: 经验值升级一致性
*For any* 经验值增加操作，如果新经验值超过当前等级阈值，玩家等级应该正确增加，且新等级的经验进度应该正确计算。
**Validates: Requirements 3.2, 3.3**

### Property 5: 背包容量限制
*For any* 背包保存操作，如果当前背包数量已达上限，系统应该阻止新增并返回错误。
**Validates: Requirements 4.3**

### Property 6: 建议价格计算
*For any* 作品评分结果，建议价格应该等于 total_score * grade_multiplier，其中 grade_multiplier 由等级决定。
**Validates: Requirements 5.2**

### Property 7: 数据库迁移幂等性
*For any* 数据库迁移脚本，多次执行应该产生相同的结果，不会因为表已存在而报错。
**Validates: Requirements 7.2**

## Error Handling

### 错误类型定义
```typescript
// lib/game/errors.ts
export class GameError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
    public userMessage?: string
  ) {
    super(message);
    this.name = 'GameError';
  }
}

export class AuthError extends GameError {
  constructor(message: string, statusCode: number = 401) {
    super(message, 'AUTH_ERROR', statusCode, '请先登录');
  }
}

export class ValidationError extends GameError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400, '输入数据无效');
  }
}

export class InventoryFullError extends GameError {
  constructor() {
    super('背包已满', 'INVENTORY_FULL', 400, '背包已满，请先清理一些作品');
  }
}
```

### API 错误响应格式
```typescript
interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    userMessage: string;
  };
}
```

### 前端错误处理
```typescript
// hooks/game/use-api-error.ts
export function useApiError() {
  const { toast } = useToast();
  
  const handleError = (error: any) => {
    const userMessage = error?.userMessage || error?.message || '操作失败，请重试';
    
    toast({
      title: '操作失败',
      description: userMessage,
      variant: 'destructive'
    });
  };
  
  return { handleError };
}
```

## Testing Strategy

### 单元测试
- 使用 Vitest 作为测试框架
- 测试评分计算函数的各种边界情况
- 测试等级计算和升级逻辑

### 属性测试
- 使用 fast-check 进行属性测试
- 验证评分系统的正确性属性
- 验证数据库迁移的幂等性

### 测试文件结构
```
__tests__/
├── game/
│   ├── scoring/
│   │   ├── score-calculator.test.ts      # 单元测试
│   │   └── score-calculator.property.ts  # 属性测试
│   ├── player/
│   │   └── level-calculator.test.ts
│   └── inventory/
│       └── inventory-service.test.ts
```

### 属性测试示例
```typescript
// __tests__/game/scoring/score-calculator.property.ts
import { fc } from 'fast-check';
import { scoreCloth, calculateTotalScore } from '@/lib/game/scoring/score-calculator';

describe('Scoring System Properties', () => {
  // Property 2: 分数范围约束
  test('all dimension scores should be within 0-100 range', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          dyeDepth: fc.float({ min: 0, max: 1 }),
          params: fc.record({
            x: fc.float({ min: 0, max: 100 }),
            y: fc.float({ min: 0, max: 100 }),
            scale: fc.float({ min: 0.5, max: 2 }),
            opacity: fc.float({ min: 0, max: 1 })
          }),
          textureId: fc.string()
        }), { minLength: 0, maxLength: 10 }),
        (layers) => {
          const result = scoreCloth(layers as any);
          return (
            result.dimensions.color_score >= 0 &&
            result.dimensions.color_score <= 100 &&
            result.dimensions.pattern_score >= 0 &&
            result.dimensions.pattern_score <= 100 &&
            result.dimensions.creativity_score >= 0 &&
            result.dimensions.creativity_score <= 100 &&
            result.dimensions.technique_score >= 0 &&
            result.dimensions.technique_score <= 100
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
```
