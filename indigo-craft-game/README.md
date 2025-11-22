# 🎮 染蓝时光 - 蓝染工艺模拟游戏

## 📂 项目结构

```
indigo-craft-game/
├── README.md                    # 本文件
├── GAME_DESIGN.md              # 详细游戏设计文档
├── IMPLEMENTATION_PLAN.md       # 前端实施计划
├── types/
│   └── game.types.ts           # TypeScript 类型定义
├── data/
│   └── levels.ts               # 关卡配置数据
├── components/                  # 游戏组件（待创建）
├── hooks/                       # 自定义 Hooks（待创建）
└── assets/                      # 游戏资源（待创建）
```

## ✅ 已完成功能

### Phase 1: 导航入口与路由 (已完成)

#### 1. 底部导航栏升级 ✅
- **文件**: `components/navigation/bottom-nav.tsx`
- **新增**: 中央凸起圆形游戏入口按钮
- **特性**:
  - 渐变蓝色背景 (indigo-500 → blue-600)
  - 染料滴图标 (Droplet from lucide-react)
  - 悬停放大效果 (scale-110)
  - 激活状态光环 (ring-4)
  - 激活时图标脉冲动画

#### 2. 游戏页面路由 ✅
**已创建路由**:
- `/indigo-game` - 游戏主页（关卡选择）
- `/indigo-game/gallery` - 作品展厅
- `/indigo-game/levels/[id]` - 游戏关卡页面

**文件列表**:
- `app/indigo-game/page.tsx` - 关卡选择主界面
- `app/indigo-game/layout.tsx` - 游戏专用布局
- `app/indigo-game/loading.tsx` - 加载状态
- `app/indigo-game/gallery/page.tsx` - 作品展厅
- `app/indigo-game/levels/[id]/page.tsx` - 关卡游戏页面

### Phase 2: 游戏主界面 (已完成)

#### 1. 关卡选择界面 ✅
**功能亮点**:
- 玩家信息卡片（等级、星星、蓝染币）
- 关卡分类筛选（新手/进阶/大师）
- 关卡网格展示
- 三星评价系统
- 锁定/解锁状态显示
- 渐变背景设计

**UI 组件**:
- 玩家信息卡 (渐变卡片)
- 关卡卡片 (带缩略图和状态)
- 分类按钮组
- 进度统计

#### 2. 作品展厅界面 ✅
**功能亮点**:
- 作品统计卡片
- 作品网格展示
- 分享/下载功能按钮
- 空状态提示

#### 3. 游戏关卡界面 ✅
**功能亮点**:
- 顶部状态栏（进度、星星、计时）
- 步骤指示器
- 提示卡片系统
- 暂停菜单
- Canvas 工作区（占位）
- 工具栏（占位）
- 步骤流程展示

**交互逻辑**:
- 实时计时器
- 暂停/继续功能
- 步骤切换
- 退出确认

### Phase 3: 数据层 (已完成)

#### 1. 类型定义 ✅
**文件**: `indigo-craft-game/types/game.types.ts`

**核心类型**:
- `Level` - 关卡配置
- `Pattern` - 图案数据
- `Tool` - 工具定义
- `PlayerProgress` - 玩家进度
- `GameSession` - 游戏会话
- `GameResult` - 游戏结果
- `Achievement` - 成就系统
- `Artwork` - 作品数据
- `GameStore` - 状态管理接口

#### 2. 关卡配置 ✅
**文件**: `indigo-craft-game/data/levels.ts`

**已配置关卡**:
1. 螺旋手帕 (新手 - 简单)
2. 条纹围巾 (新手 - 简单)
3. 圆点抱枕 (新手 - 简单)
4. 花卉蜡染 (进阶 - 中等)
5. 云纹桌布 (进阶 - 中等)
6. 冰裂纹大作 (大师 - 困难)

**每个关卡包含**:
- 基础信息（名称、难度、描述）
- 目标图案数据
- 允许工具列表
- 布料规格
- 时间限制
- 操作提示
- 奖励配置
- 三星条件

## 🎨 UI 设计规范

### 色彩方案
- **主色调**: Indigo (靛蓝) `from-indigo-500 to-blue-600`
- **辅助色**: 
  - 黄色（星星/奖励）`yellow-400`
  - 绿色（成功）`emerald-600`
  - 红色（警告）`rose-500`
- **背景**: 渐变淡蓝 `from-indigo-50 to-blue-50`

### 组件风格
- **圆角**: 默认 `rounded-lg` (12px)
- **阴影**: `shadow-lg` + 彩色阴影 `shadow-indigo-500/50`
- **动画**: `transition-all duration-300`
- **卡片**: 半透明白色 `bg-white/80 backdrop-blur-sm`

### 响应式设计
- 关卡网格: `grid-cols-2` (移动端)
- 容器: `container mx-auto px-4`
- 底部安全区: `pb-20` (为底部导航留空)

## 🚧 待开发功能

### Phase 4: 核心游戏组件 (下一步)
- [ ] Canvas 画布组件
- [ ] Fabric.js 集成
- [ ] 布料编辑器
- [ ] 染色模拟器
- [ ] 工具栏交互

### Phase 5: 游戏逻辑 (重点)
- [ ] 扎染算法实现
- [ ] 蜡染效果模拟
- [ ] 夹染逻辑
- [ ] 图案相似度计算
- [ ] 评分系统

### Phase 6: 状态管理
- [ ] Zustand Store 实现
- [ ] 本地进度保存 (IndexedDB)
- [ ] Supabase 云同步
- [ ] 成就系统

### Phase 7: 优化与完善
- [ ] 性能优化 (Web Worker)
- [ ] 音效添加
- [ ] 动画细节
- [ ] 移动端适配
- [ ] 测试与修复

## 🎯 技术栈

- **前端框架**: Next.js 14 + React 18
- **语言**: TypeScript
- **样式**: Tailwind CSS 4
- **UI 组件**: shadcn/ui (Radix)
- **图标**: Lucide React
- **Canvas**: Fabric.js (待集成)
- **状态管理**: Zustand (待集成)
- **数据库**: Supabase (云同步)

## 📦 待安装依赖

```bash
# Canvas 图形库
npm install fabric @fabricjs/react

# 状态管理
npm install zustand immer

# 类型定义
npm install -D @types/fabric
```

## 🎮 如何运行

1. **启动开发服务器**:
   ```bash
   npm run dev
   ```

2. **访问游戏入口**:
   - 点击底部导航栏中央的蓝色圆形按钮
   - 或直接访问: `http://localhost:3000/indigo-game`

3. **测试关卡**:
   - 点击任意已解锁关卡的"开始游戏"按钮
   - 访问: `http://localhost:3000/indigo-game/levels/1`

## 📝 开发笔记

### 当前进度: Phase 1-3 完成 (约 40%)

**已实现**:
- ✅ 完整的 UI 框架和导航
- ✅ 关卡选择/展厅/游戏页面
- ✅ 类型系统和数据配置
- ✅ 基础交互逻辑（计时、暂停、步骤）

**核心待开发**:
- ⏳ Canvas 画布和图形操作
- ⏳ 染色算法和效果模拟
- ⏳ 状态管理和进度保存
- ⏳ 评分和成就系统

### 下一步行动

1. **集成 Fabric.js**
   - 创建 `GameCanvas` 组件
   - 实现基础画布操作
   - 添加工具交互

2. **开发染色算法**
   - 研究扎染原理
   - 实现遮罩和渐变
   - 模拟浸染效果

3. **状态管理**
   - 创建 Zustand store
   - 实现进度保存
   - 接入 Supabase

## 🎓 学习资源

- [Fabric.js 官方文档](http://fabricjs.com/)
- [Canvas API 教程](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Zustand 状态管理](https://zustand-demo.pmnd.rs/)
- [扎染工艺原理](https://zh.wikipedia.org/wiki/扎染)

## 🤝 贡献指南

欢迎参与游戏开发！重点需要帮助的领域：
- 染色算法优化
- Canvas 性能优化
- 关卡设计和美术资源
- 音效制作

---

**项目状态**: 🚧 开发中  
**版本**: v0.1.0-alpha  
**最后更新**: 2025-11-22
