# 《蓝染·漂流记》实现规划文档
## Indigo Drift: The Traveling Cloth - Technical Implementation Plan

---

## 📋 目录

1. [项目概述](#项目概述)
2. [核心功能架构](#核心功能架构)
3. [技术栈选型](#技术栈选型)
4. [目录结构规划](#目录结构规划)
5. [数据库设计](#数据库设计)
6. [核心模块实现](#核心模块实现)
7. [AI服务集成](#ai服务集成)
8. [开发路线图](#开发路线图)

---

## 🎯 项目概述

### 游戏定位
**异步多人协作的数字蓝染创作游戏** - 将传统蓝染的"复染"工艺转化为数字化的接力创作体验。

### 核心理念
- **漂流与复染**：一块布需要经过3-5位用户的"手"才能完成
- **AI赋魂**：为每块完成的布生成独特的传记和诗意名称
- **异步社交**：无需即时通讯的温和社交，通过作品连接陌生人
- **禅意美学**：极简留白的东方美学设计

### 与现有系统的关系
- **独立游戏模块**：单独的路由和组件体系，不影响现有商城/课程功能
- **数据共享**：使用同一个Supabase实例，用户账号打通
- **素材复用**：可以将游戏作品转化为商品或课程案例
- **流量入口**：从首页、教学页、文化页引流到游戏

---

## 🏗️ 核心功能架构

### 三大核心场景

```
┌─────────────────────────────────────────────────────────────┐
│                      游戏流程图                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. 漂流河 (River)         2. 染坊 (Workshop)                 │
│  ┌─────────────┐          ┌──────────────┐                  │
│  │  浏览漂流布  │ ────────> │  初造/复染    │                 │
│  │  左滑/右滑   │          │  Canvas操作   │                 │
│  │  捞起布料    │          │  添加图层     │                 │
│  └─────────────┘          └──────────────┘                  │
│         ↓                         ↓                          │
│         │                  ┌──────────────┐                  │
│         │                  │  投放/提交    │                  │
│         │                  └──────────────┘                  │
│         │                         ↓                          │
│         └─────────────────> 漂流池 (Pool)                    │
│                                   ↓                          │
│                            达到3-5层?                         │
│                              ↓  是                            │
│                    3. 蓝博馆 (Museum)                         │
│                    ┌──────────────┐                          │
│                    │  AI生成传记   │                          │
│                    │  展示族谱     │                          │
│                    │  分享/收藏    │                          │
│                    └──────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

### 玩家操作流程

#### 创作者（初造）
1. 进入"染坊"选择白布底纹
2. 选择AI纹样素材（云纹、雨点、碎冰等）
3. 调整叠加参数（透明度、位置、大小）
4. 进行"初染"（调整蓝色深度滑块）
5. 写下寄语（可选AI润色）
6. 投放到"漂流河"

#### 复染者
1. 在"漂流河"浏览半成品
2. 查看上一任主人的寄语和染色历史
3. 右滑"捞起"进入"染坊"
4. 在现有图层基础上叠加新纹样或加深颜色
5. 写下自己的寄语
6. 提交（如果达到完成条件则触发AI生成，否则继续漂流）

#### 欣赏者
1. 在"蓝博馆"浏览完成作品
2. 查看AI生成的传记和诗意名称
3. 点击"族谱"查看参与者链
4. 收藏/分享作品
5. 关注参与者或使用"蓝草值"购买作品

---

## 🛠️ 技术栈选型

### 前端核心技术

| 技术 | 用途 | 现有项目支持 |
|-----|------|------------|
| **Next.js 14 App Router** | 页面路由与SSR | ✅ 已使用 |
| **React 18** | UI组件开发 | ✅ 已使用 |
| **TypeScript** | 类型安全 | ✅ 已使用 |
| **Canvas API** | 图层合成与渲染 | ⚠️ 需新增 |
| **Framer Motion** | 动画效果 | ✅ 已安装 |
| **Zustand** | 游戏状态管理 | ✅ 已安装 |
| **React Use Gesture** | 手势交互（滑动） | ❌ 需安装 |

### 后端与数据

| 技术 | 用途 | 现有项目支持 |
|-----|------|------------|
| **Supabase PostgreSQL** | 数据持久化 | ✅ 已使用 |
| **Supabase Storage** | 图片存储 | ✅ 已使用 |
| **Supabase Realtime** | 实时漂流池更新 | ✅ 可用 |
| **Next.js API Routes** | 后端逻辑 | ✅ 已使用 |

### AI服务

| 服务 | 用途 | 成本 |
|-----|------|------|
| **Vercel AI SDK** | AI调用框架 | 免费 |
| **Google Gemini 1.5 Flash** | 传记生成、寄语润色 | 免费额度充足 |
| **Groq (Llama 3)** | 备选方案 | 免费 |

### 新增依赖清单

```json
{
  "dependencies": {
    "@use-gesture/react": "^10.3.0",
    "ai": "^3.0.0",
    "@ai-sdk/google": "^0.0.15",
    "canvas-confetti": "^1.9.2"
  }
}
```

---

## 📁 目录结构规划

### 游戏独立目录

```
sslyapp/
├── 游戏开发/                           # 📁 游戏开发文档与规划（本文档所在）
│   ├── GAME_IMPLEMENTATION_PLAN.md    # 本文档
│   ├── CANVAS_TECH_GUIDE.md           # Canvas技术实现指南
│   ├── AI_PROMPTS.md                  # AI Prompt工程库
│   └── VISUAL_DESIGN_SPEC.md          # 视觉设计规范
│
├── app/
│   ├── drift/                         # 🌊 漂流河模块（游戏主入口）
│   │   ├── layout.tsx                 # 游戏专用布局（隐藏常规导航）
│   │   ├── page.tsx                   # 漂流河主页 (Server Component)
│   │   └── loading.tsx                # 加载动画
│   │
│   ├── workshop/                      # 🎨 染坊模块（创作工作台）
│   │   ├── new/
│   │   │   └── page.tsx               # 初造新布 (Client Component)
│   │   ├── [clothId]/
│   │   │   └── page.tsx               # 复染现有布 (Client Component)
│   │   └── components/                # 工作台专用组件
│   │       ├── CanvasWorkspace.tsx    # Canvas主画布
│   │       ├── LayerPanel.tsx         # 图层控制面板
│   │       ├── ToolDock.tsx           # 工具栏
│   │       ├── TextureLibrary.tsx     # 纹样素材库
│   │       └── DyeDepthSlider.tsx     # 染色深度滑块
│   │
│   ├── museum/                        # 🏛️ 蓝博馆模块（作品展示）
│   │   ├── page.tsx                   # 展览大厅 (Server Component)
│   │   ├── [clothId]/
│   │   │   └── page.tsx               # 单品详情页
│   │   └── components/
│   │       ├── ClothChronicle.tsx     # 作品传记展示
│   │       ├── LineageChain.tsx       # 族谱链
│   │       └── ShareCard.tsx          # 分享卡片生成
│   │
│   ├── api/
│   │   ├── drift/                     # 漂流相关API
│   │   │   ├── list/route.ts          # 获取漂流池列表
│   │   │   ├── capture/route.ts       # 捞起布料
│   │   │   └── release/route.ts       # 投放布料
│   │   │
│   │   ├── cloth/                     # 布料CRUD
│   │   │   ├── create/route.ts        # 创建新布
│   │   │   ├── [id]/route.ts          # 获取/更新单个布料
│   │   │   └── complete/route.ts      # 完成布料（触发AI）
│   │   │
│   │   ├── ai/                        # AI服务接口
│   │   │   ├── biography/route.ts     # 生成传记（流式）
│   │   │   ├── polish/route.ts        # 润色寄语
│   │   │   └── appraise/route.ts      # 颜色鉴定
│   │   │
│   │   └── game/                      # 游戏系统API
│   │       ├── quest/route.ts         # NPC任务生成
│   │       └── currency/route.ts      # 蓝草值交易
│   │
│   └── ... (现有的其他模块不变)
│
├── components/
│   ├── game/                          # 🎮 游戏通用组件
│   │   ├── ui/
│   │   │   ├── InkButton.tsx          # 印章风格按钮
│   │   │   ├── RiverWave.tsx          # 水波动画背景
│   │   │   ├── ClothCard.tsx          # 布料卡片
│   │   │   └── LineageNode.tsx        # 族谱节点
│   │   │
│   │   ├── layouts/
│   │   │   ├── GameLayout.tsx         # 游戏通用布局
│   │   │   └── ImmersiveHeader.tsx    # 沉浸式顶栏
│   │   │
│   │   └── widgets/
│   │       ├── NPCDialogue.tsx        # NPC对话框
│   │       ├── CurrencyDisplay.tsx    # 蓝草值显示
│   │       └── WeatherSync.tsx        # 天气同步组件
│   │
│   └── ... (现有组件不变)
│
├── lib/
│   ├── game/                          # 🧩 游戏逻辑库
│   │   ├── canvas/
│   │   │   ├── renderer.ts            # Canvas渲染引擎
│   │   │   ├── compositor.ts          # 图层合成器
│   │   │   ├── blending.ts            # 混合模式库
│   │   │   └── export.ts              # 导出高清图片
│   │   │
│   │   ├── ai/
│   │   │   ├── biography-gen.ts       # 传记生成器
│   │   │   ├── prompt-templates.ts    # Prompt模板
│   │   │   └── stream-handler.ts      # 流式响应处理
│   │   │
│   │   ├── mechanics/
│   │   │   ├── drift-logic.ts         # 漂流池逻辑
│   │   │   ├── completion-check.ts    # 完成度检测
│   │   │   └── currency-system.ts     # 货币系统
│   │   │
│   │   └── utils/
│   │       ├── texture-loader.ts      # 纹样加载器
│   │       ├── color-utils.ts         # 颜色工具
│   │       └── time-formatter.ts      # 时间格式化
│   │
│   └── ... (现有lib不变)
│
├── hooks/
│   ├── game/                          # 🪝 游戏专用Hooks
│   │   ├── use-canvas.ts              # Canvas操作Hook
│   │   ├── use-drift-pool.ts          # 漂流池数据Hook
│   │   ├── use-cloth-state.ts         # 布料状态管理
│   │   ├── use-gesture-control.ts     # 手势控制Hook
│   │   └── use-ai-stream.ts           # AI流式响应Hook
│   │
│   └── ... (现有hooks不变)
│
├── types/
│   ├── game.types.ts                  # 🎯 游戏类型定义
│   └── ... (现有types不变)
│
├── public/
│   ├── game-assets/                   # 🎨 游戏资源
│   │   ├── textures/                  # AI纹样素材
│   │   │   ├── cloud-pattern.png      # 云纹
│   │   │   ├── rain-dots.png          # 雨点纹
│   │   │   ├── ice-cracks.png         # 碎冰纹
│   │   │   ├── spiral.png             # 螺旋纹
│   │   │   └── ... (更多纹样)
│   │   │
│   │   ├── stamps/                    # 印章素材
│   │   │   ├── default-seal.svg
│   │   │   └── custom-templates/
│   │   │
│   │   ├── sounds/                    # 音效（可选）
│   │   │   ├── rain.mp3
│   │   │   └── dye-splash.mp3
│   │   │
│   │   └── backgrounds/               # 背景纹理
│   │       ├── paper-texture.png
│   │       └── linen-texture.png
│   │
│   └── ... (现有public不变)
│
└── supabase/
    ├── migrations/
    │   └── 20250129_game_tables.sql   # 游戏表初始化
    │
    └── ... (现有supabase不变)
```

---

## 🗄️ 数据库设计

### 核心表结构

#### 1. `cloths` 表（布料核心表）

```sql
CREATE TABLE cloths (
  -- 基础信息
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 状态管理
  status TEXT NOT NULL DEFAULT 'drifting', 
    -- 'drifting' (漂流中) | 'completed' (已完成) | 'archived' (已归档)
  
  -- 图层数据（JSON格式存储所有操作历史）
  layers JSONB NOT NULL DEFAULT '[]',
    -- 示例: [
    --   {
    --     "userId": "xxx",
    --     "userName": "小明",
    --     "textureId": "cloud-pattern",
    --     "params": {"x": 0, "y": 0, "scale": 1, "opacity": 0.8},
    --     "dyeDepth": 0.3,
    --     "message": "愿这抹蓝如山间清风",
    --     "timestamp": "2025-01-29T..."
    --   },
    --   { ... } // 第二层
    -- ]
  
  -- 完成度
  layer_count INT DEFAULT 0,
  required_layers INT DEFAULT 3, -- 需要多少层才能完成
  
  -- AI生成内容（完成后才有）
  ai_name TEXT, -- AI生成的名字，如"听雪"
  ai_biography TEXT, -- AI生成的传记
  
  -- 最终图片
  final_image_url TEXT, -- Canvas导出的高清图URL
  
  -- 社交数据
  views_count INT DEFAULT 0,
  likes_count INT DEFAULT 0,
  shares_count INT DEFAULT 0,
  
  -- 创建者（第一层的用户）
  creator_id UUID REFERENCES auth.users(id),
  
  -- 索引与约束
  CONSTRAINT valid_status CHECK (status IN ('drifting', 'completed', 'archived')),
  CONSTRAINT valid_layer_count CHECK (layer_count >= 0 AND layer_count <= 10)
);

-- 索引
CREATE INDEX idx_cloths_status ON cloths(status);
CREATE INDEX idx_cloths_creator ON cloths(creator_id);
CREATE INDEX idx_cloths_created_at ON cloths(created_at DESC);
```

#### 2. `cloth_participants` 表（参与者族谱）

```sql
CREATE TABLE cloth_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cloth_id UUID REFERENCES cloths(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  
  layer_index INT NOT NULL, -- 第几层（0=初造者，1=第一复染者...）
  contribution_type TEXT, -- 'creator' | 'dyer' | 'finisher'
  
  message TEXT, -- 该用户的寄语
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- 该用户在此作品中获得的奖励
  currency_earned INT DEFAULT 0,
  
  UNIQUE(cloth_id, user_id, layer_index)
);

CREATE INDEX idx_participants_cloth ON cloth_participants(cloth_id);
CREATE INDEX idx_participants_user ON cloth_participants(user_id);
```

#### 3. `drift_pool` 表（漂流池快照，优化查询）

```sql
-- 这是一个视图或物化视图，用于快速查询"漂流河"中的布料
CREATE MATERIALIZED VIEW drift_pool AS
SELECT 
  c.id,
  c.created_at,
  c.updated_at,
  c.layers,
  c.layer_count,
  c.required_layers,
  c.creator_id,
  u.username AS creator_name,
  u.avatar_url AS creator_avatar,
  -- 最新的一条寄语
  (c.layers->-1->>'message') AS latest_message,
  -- 漂流天数
  EXTRACT(DAY FROM NOW() - c.created_at) AS drift_days
FROM cloths c
LEFT JOIN profiles u ON c.creator_id = u.id
WHERE c.status = 'drifting'
ORDER BY c.updated_at DESC;

-- 定期刷新（可以设置Postgres定时任务）
CREATE UNIQUE INDEX ON drift_pool (id);
```

#### 4. `user_game_profile` 表（玩家游戏数据）

```sql
CREATE TABLE user_game_profile (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  
  -- 货币系统
  currency INT DEFAULT 0, -- 蓝草值
  
  -- 成就统计
  cloths_created INT DEFAULT 0, -- 初造了多少布
  cloths_dyed INT DEFAULT 0, -- 复染了多少布
  cloths_completed INT DEFAULT 0, -- 完成了多少布（作为最后一层）
  
  -- 等级系统（可选）
  level INT DEFAULT 1,
  exp INT DEFAULT 0,
  
  -- 个人设置
  custom_stamp_url TEXT, -- 自定义印章
  preferred_textures JSONB DEFAULT '[]', -- 收藏的纹样ID
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 5. `npc_quests` 表（NPC任务系统，可选）

```sql
CREATE TABLE npc_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- AI生成的任务描述
  title TEXT NOT NULL, -- 如"寻找霜降之蓝"
  description TEXT, -- AI生成的任务详情
  
  -- 任务要求（JSON格式）
  requirements JSONB,
    -- 示例: {
    --   "minLayers": 3,
    --   "requiredTextures": ["cloud-pattern"],
    --   "colorRange": {"hue": [200, 240], "saturation": [0.5, 1]}
    -- }
  
  -- 奖励
  reward_currency INT,
  
  -- 时间限制
  active_from TIMESTAMPTZ DEFAULT NOW(),
  active_until TIMESTAMPTZ,
  
  -- 完成情况
  completion_count INT DEFAULT 0,
  max_completions INT DEFAULT 100
);
```

### RLS 策略

```sql
-- cloths 表：所有人可读，仅创建者可更新未完成的布
ALTER TABLE cloths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cloths are viewable by everyone"
  ON cloths FOR SELECT
  USING (true);

CREATE POLICY "Users can insert cloths"
  ON cloths FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their own drifting cloths"
  ON cloths FOR UPDATE
  USING (auth.uid() = creator_id AND status = 'drifting');

-- cloth_participants 表：所有人可读，仅相关用户可写
ALTER TABLE cloth_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants viewable by everyone"
  ON cloth_participants FOR SELECT
  USING (true);

CREATE POLICY "Users can add themselves as participants"
  ON cloth_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

## 🎨 核心模块实现

### 1. Canvas 渲染引擎

#### 文件：`lib/game/canvas/renderer.ts`

```typescript
/**
 * Canvas 渲染引擎
 * 负责将 JSON 格式的 layers 数据渲染成可视化的布料
 */

import { Layer } from '@/types/game.types'

export class ClothRenderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private textures: Map<string, HTMLImageElement> = new Map()

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    
    // 设置高DPI支持
    const dpr = window.devicePixelRatio || 1
    canvas.width = canvas.offsetWidth * dpr
    canvas.height = canvas.offsetHeight * dpr
    this.ctx.scale(dpr, dpr)
  }

  /**
   * 预加载纹样素材
   */
  async loadTextures(textureIds: string[]): Promise<void> {
    const promises = textureIds.map(async (id) => {
      const img = new Image()
      img.src = `/game-assets/textures/${id}.png`
      await img.decode()
      this.textures.set(id, img)
    })
    await Promise.all(promises)
  }

  /**
   * 渲染所有图层
   */
  async render(layers: Layer[]): Promise<void> {
    // 清空画布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // 绘制白布底色
    this.ctx.fillStyle = '#f8f8f8'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // 逐层绘制
    for (const layer of layers) {
      await this.renderLayer(layer)
    }
  }

  /**
   * 渲染单个图层
   */
  private async renderLayer(layer: Layer): Promise<void> {
    const texture = this.textures.get(layer.textureId)
    if (!texture) {
      console.warn(`Texture ${layer.textureId} not loaded`)
      return
    }

    // 保存当前状态
    this.ctx.save()

    // 设置混合模式（关键：模拟染料渗入效果）
    this.ctx.globalCompositeOperation = 'multiply'
    this.ctx.globalAlpha = layer.params.opacity

    // 应用变换
    this.ctx.translate(layer.params.x, layer.params.y)
    this.ctx.scale(layer.params.scale, layer.params.scale)
    if (layer.params.rotation) {
      this.ctx.rotate((layer.params.rotation * Math.PI) / 180)
    }

    // 绘制纹样
    this.ctx.drawImage(
      texture,
      -texture.width / 2,
      -texture.height / 2,
      texture.width,
      texture.height
    )

    // 应用染色深度（叠加蓝色滤镜）
    if (layer.dyeDepth > 0) {
      this.ctx.globalCompositeOperation = 'overlay'
      this.ctx.globalAlpha = layer.dyeDepth
      this.ctx.fillStyle = `hsl(210, 80%, 40%)` // 靛蓝色
      this.ctx.fillRect(
        -texture.width / 2,
        -texture.height / 2,
        texture.width,
        texture.height
      )
    }

    // 恢复状态
    this.ctx.restore()
  }

  /**
   * 导出高清图片（用于最终完成时保存）
   */
  exportImage(format: 'png' | 'jpeg' = 'png', quality: number = 0.95): string {
    return this.canvas.toDataURL(`image/${format}`, quality)
  }

  /**
   * 下载图片
   */
  downloadImage(filename: string): void {
    const link = document.createElement('a')
    link.download = `${filename}.png`
    link.href = this.exportImage()
    link.click()
  }
}
```

#### 使用示例：`app/workshop/[clothId]/page.tsx`

```typescript
'use client'

import { useEffect, useRef } from 'react'
import { ClothRenderer } from '@/lib/game/canvas/renderer'
import { useClothState } from '@/hooks/game/use-cloth-state'

export default function WorkshopPage({ params }: { params: { clothId: string } }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { cloth, addLayer } = useClothState(params.clothId)
  
  useEffect(() => {
    if (!canvasRef.current || !cloth) return
    
    const renderer = new ClothRenderer(canvasRef.current)
    
    // 预加载所有需要的纹样
    const textureIds = cloth.layers.map(l => l.textureId)
    renderer.loadTextures(textureIds).then(() => {
      renderer.render(cloth.layers)
    })
  }, [cloth])

  return (
    <div className="workshop-container">
      <canvas
        ref={canvasRef}
        className="cloth-canvas"
        width={800}
        height={800}
      />
      {/* 工具栏等其他UI */}
    </div>
  )
}
```

---

### 2. AI 传记生成服务

#### 文件：`app/api/ai/biography/route.ts`

```typescript
import { streamText } from 'ai'
import { google } from '@ai-sdk/google'
import { createServerClient } from '@/lib/supabase/server'

export const runtime = 'edge'

export async function POST(req: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { clothId } = await req.json()

  // 从数据库获取布料信息
  const { data: cloth } = await supabase
    .from('cloths')
    .select('*, cloth_participants(*)')
    .eq('id', clothId)
    .single()

  if (!cloth) {
    return new Response('Cloth not found', { status: 404 })
  }

  // 构建 Prompt
  const prompt = buildBiographyPrompt(cloth)

  // 流式生成
  const result = await streamText({
    model: google('models/gemini-1.5-flash-latest'),
    prompt,
    temperature: 0.8,
    maxTokens: 200,
  })

  // 保存生成结果到数据库（在后台异步执行）
  saveBiography(clothId, result)

  return result.toAIStreamResponse()
}

/**
 * 构建传记生成的 Prompt
 */
function buildBiographyPrompt(cloth: any): string {
  const participants = cloth.cloth_participants
    .map((p: any, i: number) => {
      return `第${i + 1}层: ${p.profiles.username}，使用了${p.layer_texture}纹样，寄语是"${p.message}"`
    })
    .join('\n')

  return `
你是一位资深的蓝染非遗传承人，擅长用诗意的语言讲述每一块布料的故事。

现在有一块蓝染布料，它经过了${cloth.layer_count}位匠人的手：

${participants}

请完成以下任务：
1. 为这块布起一个符合中国传统色彩美学的名字（2-4个字）
2. 写一段50字以内的散文诗，描述这块布的诞生过程和意境
3. 格式如下：

名：<名字>
记：<散文诗>

要求：
- 语言优美、意境深远
- 融入参与者的寄语和纹样特点
- 体现蓝染的"复染"精神
- 不要过于夸张或浮华
`.trim()
}

/**
 * 保存AI生成的传记到数据库
 */
async function saveBiography(clothId: string, result: any) {
  const supabase = await createServerClient()
  
  // 等待流式生成完成
  const fullText = await result.text

  // 解析名字和传记
  const nameMatch = fullText.match(/名：(.+)/)
  const bioMatch = fullText.match(/记：(.+)/)

  await supabase
    .from('cloths')
    .update({
      ai_name: nameMatch?.[1]?.trim(),
      ai_biography: bioMatch?.[1]?.trim(),
      status: 'completed',
    })
    .eq('id', clothId)
}
```

#### 前端调用示例：`components/game/ClothChronicle.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useAIStream } from '@/hooks/game/use-ai-stream'

export function ClothChronicle({ clothId }: { clothId: string }) {
  const [biography, setBiography] = useState('')
  const { streamText, isLoading } = useAIStream()

  useEffect(() => {
    streamText(`/api/ai/biography`, { clothId }, (chunk) => {
      setBiography(prev => prev + chunk)
    })
  }, [clothId])

  return (
    <div className="chronicle-container">
      {isLoading && <span className="typing-cursor">▌</span>}
      <div className="biography-text">
        {biography.split('\n').map((line, i) => (
          <p key={i} className="fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
            {line}
          </p>
        ))}
      </div>
    </div>
  )
}
```

---

### 3. 漂流池数据管理

#### Hook: `hooks/game/use-drift-pool.ts`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import type { DriftCloth } from '@/types/game.types'

export function useDriftPool() {
  const [cloths, setCloths] = useState<DriftCloth[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    loadCloths()

    // 订阅实时更新
    const channel = supabase
      .channel('drift-pool')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cloths',
          filter: 'status=eq.drifting',
        },
        (payload) => {
          handleRealtimeUpdate(payload)
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  async function loadCloths() {
    setLoading(true)
    const { data, error } = await supabase
      .from('cloths')
      .select(`
        *,
        creator:profiles!creator_id(username, avatar_url),
        participants:cloth_participants(count)
      `)
      .eq('status', 'drifting')
      .order('updated_at', { ascending: false })
      .limit(20)

    if (data) {
      setCloths(data)
    }
    setLoading(false)
  }

  function handleRealtimeUpdate(payload: any) {
    if (payload.eventType === 'INSERT') {
      setCloths(prev => [payload.new, ...prev])
    } else if (payload.eventType === 'UPDATE') {
      setCloths(prev =>
        prev.map(c => (c.id === payload.new.id ? payload.new : c))
      )
    } else if (payload.eventType === 'DELETE') {
      setCloths(prev => prev.filter(c => c.id !== payload.old.id))
    }
  }

  /**
   * 捞起布料（右滑操作）
   */
  async function captureCloth(clothId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // 调用API
    const response = await fetch('/api/drift/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clothId }),
    })

    if (!response.ok) throw new Error('Failed to capture cloth')

    // 从本地列表移除
    setCloths(prev => prev.filter(c => c.id !== clothId))

    return response.json()
  }

  return {
    cloths,
    loading,
    captureCloth,
    refresh: loadCloths,
  }
}
```

---

## 🤖 AI 服务集成

### Prompt 工程库

#### 文件：`lib/game/ai/prompt-templates.ts`

```typescript
/**
 * AI Prompt 模板库
 * 所有与AI交互的Prompt统一在此管理
 */

export const PromptTemplates = {
  /**
   * 传记生成
   */
  biography: (context: {
    layers: Array<{ userName: string; texture: string; message: string }>
    createdAt: string
    layerCount: number
  }) => `
你是一位资深的蓝染非遗传承人，擅长用诗意的语言讲述每一块布料的故事。

布料信息：
- 创建时间：${context.createdAt}
- 经手人数：${context.layerCount}位

制作历程：
${context.layers.map((l, i) => `第${i + 1}层：${l.userName}使用${l.texture}，寄语"${l.message}"`).join('\n')}

请完成：
1. 起一个2-4字的中国传统色彩名（如"听雪"、"暮云"、"沧海"）
2. 写一段50字内的散文诗，融入参与者的寄语和纹样

格式：
名：<名字>
记：<散文诗>
`,

  /**
   * 寄语润色
   */
  polishMessage: (rawMessage: string) => `
请将以下用户的简单寄语，改写为富有诗意、符合蓝染文化意境的短句（不超过20字）。

原文："${rawMessage}"

要求：
- 保持原意
- 增加意境和美感
- 不要过于文绉绉
- 符合中国传统美学

直接输出改写后的结果，不要解释。
`,

  /**
   * NPC任务生成（根据天气/节气）
   */
  generateQuest: (context: {
    date: string
    weather: string
    season: string
  }) => `
你是一位云游四方的蓝染商人，今天需要发布一个收购任务。

当前情况：
- 日期：${context.date}
- 天气：${context.weather}
- 季节：${context.season}

请生成一个任务：
1. 任务标题（8-12字，富有诗意）
2. 任务描述（30字内，说明想要什么样的布料）
3. 要求的颜色特征（用传统色名，如"月白"、"靛蓝"、"胜色"等）

格式（JSON）：
{
  "title": "任务标题",
  "description": "任务描述",
  "colorHint": "颜色特征"
}
`,

  /**
   * 颜色鉴定
   */
  appraiseColor: (layers: Array<{ texture: string; dyeDepth: number }>) => `
作为蓝染鉴定师，请根据以下图层信息，推荐一个最适合的背景色（16进制色值）：

图层：
${layers.map((l, i) => `第${i + 1}层：${l.texture}，染色深度${l.dyeDepth}`).join('\n')}

要求：
- 给出一个16进制颜色值（如 #1f4e79）
- 这个颜色应该与当前的蓝色形成和谐的视觉关系
- 可以是同类色或补色

只输出颜色值，不要解释。
`,
}
```

### AI 调用封装

#### 文件：`lib/game/ai/client.ts`

```typescript
import { streamText, generateText } from 'ai'
import { google } from '@ai-sdk/google'
import { PromptTemplates } from './prompt-templates'

/**
 * AI 客户端封装
 * 提供统一的调用接口
 */
export class AIGameMaster {
  private model = google('models/gemini-1.5-flash-latest')

  /**
   * 流式生成传记
   */
  async streamBiography(context: any, onChunk: (text: string) => void) {
    const result = await streamText({
      model: this.model,
      prompt: PromptTemplates.biography(context),
      temperature: 0.8,
      maxTokens: 200,
    })

    for await (const chunk of result.textStream) {
      onChunk(chunk)
    }

    return result.text
  }

  /**
   * 润色寄语（同步）
   */
  async polishMessage(rawMessage: string): Promise<string> {
    const result = await generateText({
      model: this.model,
      prompt: PromptTemplates.polishMessage(rawMessage),
      temperature: 0.7,
      maxTokens: 50,
    })

    return result.text.trim()
  }

  /**
   * 生成NPC任务
   */
  async generateQuest(context: any): Promise<{
    title: string
    description: string
    colorHint: string
  }> {
    const result = await generateText({
      model: this.model,
      prompt: PromptTemplates.generateQuest(context),
      temperature: 0.9,
      maxTokens: 150,
    })

    try {
      return JSON.parse(result.text)
    } catch {
      // 如果AI没有返回有效JSON，返回默认值
      return {
        title: '寻找深邃之蓝',
        description: '我需要一块颜色深沉、纹理细腻的蓝染布',
        colorHint: '靛蓝',
      }
    }
  }

  /**
   * 颜色鉴定
   */
  async appraiseColor(layers: any[]): Promise<string> {
    const result = await generateText({
      model: this.model,
      prompt: PromptTemplates.appraiseColor(layers),
      temperature: 0.5,
      maxTokens: 20,
    })

    // 提取16进制颜色值
    const match = result.text.match(/#[0-9a-fA-F]{6}/)
    return match?.[0] || '#1f4e79'
  }
}
```

---

## 📅 开发路线图

### Phase 1: 核心基础（2-3周）

**目标**：实现最小可玩版本（MVP）

#### Week 1: 数据层与基础组件
- [ ] 创建游戏数据库表结构
- [ ] 编写RLS策略
- [ ] 搭建 `/app/drift`、`/app/workshop`、`/app/museum` 路由框架
- [ ] 实现 Canvas 渲染引擎基础版
- [ ] 准备10-15个AI纹样素材（PNG格式）

#### Week 2: 核心玩法实现
- [ ] 实现"初造"流程（新建布料）
  - [ ] 纹样选择器
  - [ ] 染色深度滑块
  - [ ] 寄语输入框
  - [ ] 投放到漂流池
- [ ] 实现"漂流河"页面
  - [ ] 卡片滑动交互
  - [ ] 捞起布料逻辑
- [ ] 实现"复染"流程
  - [ ] 加载现有图层
  - [ ] 叠加新图层
  - [ ] 提交逻辑

#### Week 3: AI集成与完成流程
- [ ] 集成 Vercel AI SDK
- [ ] 实现传记生成API
- [ ] 实现"蓝博馆"展示页
  - [ ] 流式显示AI传记
  - [ ] 族谱链展示
  - [ ] 分享功能
- [ ] 测试完整流程

---

### Phase 2: 体验优化（2周）

**目标**：提升视觉效果和交互体验

#### Week 4: 视觉美化
- [ ] 实现东方美学设计系统
  - [ ] 自定义色彩变量
  - [ ] 纸纹/噪点背景纹理
  - [ ] 印章风格按钮
- [ ] 添加动画效果
  - [ ] 水波流动背景
  - [ ] 布料卡片悬停效果
  - [ ] 页面过渡动画
- [ ] 优化Canvas渲染性能
  - [ ] 图层缓存
  - [ ] 懒加载纹样

#### Week 5: 交互增强
- [ ] 实现手势控制（左滑/右滑）
- [ ] 添加音效（可选）
  - [ ] 染色时的水声
  - [ ] 完成时的铃声
- [ ] 实现天气同步功能
- [ ] 移动端适配优化

---

### Phase 3: 社交与经济系统（2周）

**目标**：增加长期玩法和用户留存

#### Week 6: 货币与奖励
- [ ] 实现"蓝草值"货币系统
- [ ] 完成布料后的奖励分配
- [ ] 用户游戏档案页面
  - [ ] 统计数据展示
  - [ ] 作品集
  - [ ] 成就系统

#### Week 7: NPC与任务
- [ ] 实现NPC"云游商人"
- [ ] AI动态生成每日任务
- [ ] 任务提交与验证
- [ ] 排行榜系统

---

### Phase 4: 高级功能（可选，2-3周）

**目标**：增加深度和复杂度

#### Week 8-9: 市集与交易
- [ ] 实现布料交易市场
- [ ] 作品出售功能
- [ ] 收益分配机制
- [ ] 高级纹样解锁系统

#### Week 10: 印章系统
- [ ] 用户自定义印章上传
- [ ] AI生成印章图案
- [ ] 印章盖章动画

---

## 🎯 核心技术难点与解决方案

### 难点1：Canvas图层合成性能

**问题**：多图层叠加时，实时渲染可能卡顿

**解决方案**：
1. 使用 `OffscreenCanvas` 在 Web Worker 中渲染
2. 实现图层缓存，只重绘变化的部分
3. 限制图层数量（最多10层）
4. 使用 `requestAnimationFrame` 控制渲染频率

### 难点2：AI生成成本控制

**问题**：大量用户同时请求AI可能超出免费额度

**解决方案**：
1. 优先使用 Gemini 1.5 Flash（免费额度最大）
2. 实现请求队列，限流处理
3. 缓存常见的AI响应（如润色寄语）
4. 为VIP用户提供无限AI调用（收费模式）

### 难点3：漂流池数据一致性

**问题**：多用户同时捞起同一块布

**解决方案**：
1. 使用数据库事务 + 乐观锁
2. 捞起操作需要检查布料状态
3. 失败时提示"布料已被他人捞走"

```sql
-- 捞起操作的事务
BEGIN;
  -- 检查并锁定
  SELECT * FROM cloths WHERE id = $1 AND status = 'drifting' FOR UPDATE;
  
  -- 更新为"正在复染"状态
  UPDATE cloths SET status = 'in_progress', current_dyer_id = $2 WHERE id = $1;
COMMIT;
```

### 难点4：图片存储成本

**问题**：每块完成的布都需要保存高清图

**解决方案**：
1. 中间过程只存JSON（几KB）
2. 仅最终完成时才导出PNG并上传
3. 使用Supabase Storage的免费额度（1GB）
4. 定期清理低浏览量的旧作品

---

## 🔧 开发环境配置

### 环境变量

在 `.env.local` 中添加：

```bash
# AI服务
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key # 备用

# 游戏专用Bucket
SUPABASE_GAME_BUCKET=game-cloths

# 功能开关
ENABLE_GAME_MODULE=true
ENABLE_NPC_QUESTS=false # 初期可关闭
ENABLE_MARKETPLACE=false # 初期可关闭
```

### 安装依赖

```bash
cd sslyapp
npm install @use-gesture/react ai @ai-sdk/google canvas-confetti
```

### 创建Supabase Bucket

```sql
-- 在Supabase SQL Editor执行
INSERT INTO storage.buckets (id, name, public)
VALUES ('game-cloths', 'game-cloths', true);

-- 设置存储策略
CREATE POLICY "Game cloths are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'game-cloths');

CREATE POLICY "Authenticated users can upload game cloths"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'game-cloths' 
  AND auth.role() = 'authenticated'
);
```

---

## 📝 开发规范

### 组件命名
- 游戏专用组件以 `Game` 开头，如 `GameClothCard`
- Canvas相关组件以 `Canvas` 开头，如 `CanvasWorkspace`
- AI相关组件以 `AI` 开头，如 `AIBiographyStream`

### 类型定义

所有游戏相关类型在 `types/game.types.ts` 中统一定义：

```typescript
// types/game.types.ts
export interface Layer {
  userId: string
  userName: string
  avatarUrl?: string
  textureId: string // 如 'cloud-pattern'
  params: {
    x: number
    y: number
    scale: number
    rotation?: number
    opacity: number
  }
  dyeDepth: number // 0-1
  message: string
  timestamp: string
}

export interface Cloth {
  id: string
  createdAt: string
  updatedAt: string
  status: 'drifting' | 'in_progress' | 'completed' | 'archived'
  layers: Layer[]
  layerCount: number
  requiredLayers: number
  aiName?: string
  aiBiography?: string
  finalImageUrl?: string
  creatorId: string
}

export interface DriftCloth extends Cloth {
  creator: {
    username: string
    avatarUrl?: string
  }
  driftDays: number
  latestMessage: string
}

export interface UserGameProfile {
  userId: string
  currency: number
  clothsCreated: number
  clothsDyed: number
  clothsCompleted: number
  level: number
  exp: number
}
```

### Git提交规范

游戏模块的提交使用前缀 `[GAME]`：

```bash
git commit -m "[GAME] 实现Canvas渲染引擎"
git commit -m "[GAME] 集成AI传记生成"
git commit -m "[GAME] 优化漂流池滑动交互"
```

---

## 🚀 部署与测试

### 本地开发

```bash
# 启动开发服务器
npm run dev

# 访问游戏入口
# http://localhost:3000/drift
```

### 测试清单

#### 单元测试
- [ ] Canvas渲染引擎测试
- [ ] 图层合成逻辑测试
- [ ] AI Prompt模板测试

#### 集成测试
- [ ] 完整创作流程测试
- [ ] 漂流池捞起逻辑测试
- [ ] AI生成传记测试
- [ ] 数据库事务测试

#### E2E测试（使用Playwright）
- [ ] 用户A创建布料
- [ ] 用户B捞起并复染
- [ ] 用户C完成布料
- [ ] 查看AI生成的传记

### 生产部署

```bash
# Vercel部署
vercel --prod

# 环境变量检查
# ✓ GOOGLE_GENERATIVE_AI_API_KEY
# ✓ SUPABASE_URL
# ✓ SUPABASE_ANON_KEY
```

---

## 📚 参考资源

### 技术文档
- [Canvas API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Use Gesture - React](https://use-gesture.netlify.app/)

### 设计灵感
- [传统蓝染工艺流程](https://zh.wikipedia.org/wiki/%E8%93%9D%E6%9F%93)
- [日本浮世绘叠色技法](https://ukiyo-e.org/)
- [故宫博物院数字文物](https://www.dpm.org.cn/)

---

## 🎉 总结

《蓝染·漂流记》是一个将传统工艺、现代技术和AI赋能完美结合的创新游戏项目。通过异步多人协作的方式，让用户在轻松的操作中体验蓝染文化的深厚底蕴，同时通过AI生成的诗意传记，为每一件作品注入灵魂。

**核心优势**：
- ✅ 技术栈与现有项目完美契合
- ✅ 开发成本可控（免费AI服务）
- ✅ 用户门槛低，上手快
- ✅ 长期玩法丰富，可扩展性强
- ✅ 具有文化传播价值和社会意义

**下一步行动**：
1. 审阅本文档，确认技术方案
2. 创建 `游戏开发/` 目录并提交本文档
3. 开始Phase 1开发：数据层与基础组件

---

**文档版本**: v1.0  
**创建日期**: 2025-01-29  
**作者**: Cascade AI + 项目团队  
**状态**: 📝 规划完成，待开发
