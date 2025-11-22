# 世说蓝语 - 蓝染文化传承平台

## 项目概述
"世说蓝语"是一个专注于蓝染文化传承与推广的综合性平台，致力于将传统蓝染工艺与现代设计相结合，通过教学课程、文创产品销售、AI创作和文化传播，让更多人了解和喜爱这一古老而美丽的工艺。项目融合了传统文化与现代技术，为用户提供沉浸式的蓝染文化体验。

---

## ⚡ 快速上手（开发者速览）

| 步骤 | 操作 | 说明 |
| --- | --- | --- |
| 1 | `cp .env.example .env.local` | 填写 Supabase URL/Key（必须） |
| 2 | `npm install` 或 `pnpm install` | 安装依赖 |
| 3 | `npm run init-db` | 初始化数据库/运行 RLS 脚本 |
| 4 | 在 Supabase SQL Editor 执行 `supabase/products-schema.sql` | 新建产品/媒体表并写入示例结构 |
| 5 | `npm run seed:products` | 上传 `public/` 中的示例图片到 Storage 并写入示例产品 |
| 6 | `npm run dev` | 启动 Next.js App Router |
| 7 | 访问 `http://localhost:3000` | 首次加载需 Supabase 正常运行 |

**核心命令速查**
```bash
npm run dev        # 开发调试
npm run build      # 生产构建
npm run lint       # 手动触发 ESLint（默认构建忽略）
npm run init-db    # 同步本地 Supabase schema
npm run seed:products  # 上传示例媒体并写入示例产品
```

**关键环境变量（.env.local）**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
SUPABASE_PRODUCT_BUCKET=product-media   # 可选，bucket 名与脚本保持一致
```
> 若启用 S3 上传，再补充 `AWS_*` 相关变量；其余变量见 `Supabase环境变量配置指南.md`。

> 🔁 **快速初始化产品与媒体**  
> 1. 在 Supabase SQL Editor 粘贴并执行 `supabase/products-schema.sql`；  
> 2. 本地命令行运行 `npm run seed:products`；  
> 3. 重启 `npm run dev`，商店/收藏/购物车即可显示同一套图片。

---

## 🆕 最近重要变更（2025-11）

- **收藏系统重构**：引入 `FavoritesProvider` 共享上下文，课程/商品收藏、数量统计与"我的收藏"页同步刷新；支持课程与商品共用 `favorites` 表（含 `item_type` / `course_id`）。
- **课程收藏功能完善**：教学页、课程详情页、收藏列表等全面支持课程收藏/取消收藏；`favorites` API 支持课程与商品的增删查。
- **购物车与商品详情修复**：
  - 统一产品表字段：使用 `inventory` 替代 `in_stock`/`stock_quantity`，避免字段不存在错误。
  - 修复商品详情页"产品不存在"问题：`/api/products/[id]` 支持 slug 和 UUID 查询。
  - 修复加入购物车 404 错误：`/api/cart` 使用正确的 `inventory` 字段查询库存。
  - 全局挂载 `<Toaster />` 组件，确保所有 toast 提示正常显示。
- **性能优化**：
  - 首页、课程页关键组件懒加载、图片按需加载（`OptimizedImage` + Next 图片配置）。
  - 禁用 Link 预取减少客户端空耗请求。
  - `next.config.mjs` 启用 `optimizePackageImports`、AVIF/WebP 输出、远程图片白名单。
- **数据库脚本**：`fix-favorites-for-courses.sql` 使 `favorites` 表兼容课程收藏（`item_type`、`course_id`、部分唯一索引）。
- **购物车 & 立即购买打通**：`use-cart` Hook 引入授权请求头、精选状态管理与 `selectExclusiveCartItems`；`/api/cart` 与 `/api/user/orders/create` 现根据真实登录用户执行，商品详情页"立即购买"自动勾选对应购物车项并跳转结算。
- **本地兜底数据映射增强**：`data/models.ts` 预先构建 `courseLookupMap`，支持数字ID/UUID互查；`hooks/use-favorites.ts` 在渲染收藏课程前统一做 ID 正规化/反向转换，彻底消除"未知课程"占位和刷新后状态丢失问题，后续排查同类问题可直接复用该策略。
- **错误修复**：解决"未知课程""收藏数量不一致""课程无法取消收藏""React key 警告"等问题。
- **统一搜索体验**：新增 `culture_articles` 表与 `search_content()` 函数，`/api/search` + `/search` 页面可一次检索商品 / 课程 / 文章；`SearchBar` 默认跳转搜索结果页。

> ⚠️ 升级代码后请务必重新执行 `fix-favorites-for-courses.sql` 并重启开发服务，否则收藏接口会报错。

### 🔍 全局搜索初始化
1. 在 Supabase SQL Editor 重新执行 `supabase/schemas.sql`（将自动创建 `culture_articles`、示例文章与 `search_content()` 函数）。
2. 若尚未导入课程数据，可运行 `supabase/migrations/20241118-seed-sample-courses.sql`，或根据需要插入自定义课程/文章内容。
3. 重启 `npm run dev`，使用任意搜索框即可跳转 `http://localhost:3000/search?q=...` 查看统一搜索结果列表。

## 技术架构

### 前端技术栈
- **框架**: Next.js 14.2.16 (App Router架构)
- **语言**: TypeScript 5+
- **样式**: Tailwind CSS 4.1.9
- **UI组件**: Radix UI、自定义组件库
- **图标库**: Lucide React 0.454.0
- **表单处理**: React Hook Form 7.60.0、@hookform/resolvers 3.10.0、Zod 3.25.67
- **状态管理**: React Context API
- **主题切换**: Next Themes 0.4.6
- **动画效果**: Tailwind CSS Animate、tw-animate-css
- **工具库**: Class Variance Authority、clsx、Tailwind Merge
- **数据可视化**: Recharts 2.15.4
- **日期处理**: date-fns 4.1.0
- **轮播组件**: Embla Carousel React 8.5.1
- **性能监控**: 自定义性能监控系统
- **懒加载**: React.lazy + Suspense + IntersectionObserver

### 后端技术栈
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **存储**: Supabase Storage
- **API**: Next.js API Routes
- **实时通信**: Supabase Realtime
- **文件上传**: AWS S3 (可选)

### 部署与托管
- **前端托管**: Vercel
- **数据库托管**: Supabase
- **文件存储**: Supabase Storage + AWS S3 (可选)

## 项目结构

```
世说蓝语app/
├── app/                    # Next.js App Router 主目录
│   ├── layout.tsx         # 根布局组件
│   ├── page.tsx           # 首页
│   ├── admin/             # 管理后台
│   │   ├── course-edit/   # 课程编辑
│   │   └── product-edit/  # 产品编辑
│   ├── api/               # API路由
│   │   ├── cart/          # 购物车API
│   │   ├── files/         # 文件上传API
│   │   ├── init-database/ # 数据库初始化
│   │   ├── messages/      # 消息API
│   │   ├── products/      # 产品API
│   │   ├── upload/        # 上传API
│   │   └── user/          # 用户API
│   ├── auth/              # 认证页面
│   ├── cart/              # 购物车
│   ├── checkout/          # 结算流程
│   │   ├── cancel/        # 支付取消页面
│   │   └── success/       # 支付成功页面
│   ├── contact/           # 联系我们
│   ├── culture/           # 文化内容
│   ├── messages/          # 消息中心
│   ├── notifications/     # 通知中心
│   ├── profile/           # 用户个人中心
│   │   ├── addresses/     # 地址管理
│   │   ├── courses/       # 我的课程
│   │   ├── favorites/     # 收藏夹
│   │   ├── orders/        # 订单管理
│   │   └── settings/      # 设置
│   ├── setup-database/    # 数据库设置
│   ├── store/             # 文创商店模块
│   │   ├── [id]/          # 产品详情页
│   │   ├── accessories/   # 配饰专题页
│   │   ├── ai-create/     # AI创作页面
│   │   ├── clothing/      # 服饰专题页
│   │   ├── custom/        # 定制工坊专题页
│   │   ├── home/          # 家居专题页
│   │   ├── materials/     # 材料包专题页
│   │   ├── tie-dye/       # 扎染专题页
│   │   └── wax-resist/    # 蜡染专题页
│   ├── teaching/          # 教学课程模块
│   │   ├── [id]/          # 课程详情页
│   │   ├── tie-dye/       # 扎染课程专题页
│   │   └── wax-resist/    # 蜡染课程专题页
│   ├── globals.css        # 全局样式
│   └── loading.tsx        # 加载页面
├── components/            # 组件库
│   ├── auth/              # 认证相关组件
│   ├── navigation/        # 导航相关组件
│   │   └── bottom-nav.tsx # 底部导航
│   ├── templates/         # 页面模板
│   └── ui/                # 通用UI组件
│       ├── accordion.tsx  # 手风琴组件
│       ├── alert-dialog.tsx # 警告对话框
│       ├── alert.tsx      # 警告提示
│       ├── badge.tsx      # 徽章
│       ├── banner-carousel.tsx # 轮播图
│       ├── button.tsx     # 按钮
│       ├── card.tsx       # 卡片
│       ├── carousel.tsx   # 轮播
│       ├── cart-item.tsx  # 购物车项
│       ├── course-card.tsx # 课程卡片
│       ├── course-list-card.tsx # 课程列表卡片
│       ├── dialog.tsx     # 对话框
│       ├── drawer.tsx     # 抽屉
│       ├── filter-bar.tsx # 筛选栏
│       ├── form.tsx       # 表单
│       ├── input.tsx      # 输入框
│       ├── lazy-load.tsx  # 懒加载组件集合
│       ├── login-form.tsx # 登录表单
│       ├── message-item.tsx # 消息项
│       ├── notification-popover.tsx # 通知弹出框
│       ├── optimized-image.tsx # 优化图片
│       ├── pagination.tsx # 分页
│       ├── performance-monitor.tsx # 性能监控组件
│       ├── product-card.tsx # 产品卡片
│       ├── product-grid-card.tsx # 产品网格卡片
│       ├── product-image-gallery.tsx # 产品图片画廊
│       ├── quick-access.tsx # 快捷访问
│       ├── search-bar.tsx # 搜索栏
│       ├── sheet.tsx      # 侧边栏
│       ├── skeleton.tsx   # 骨架屏
│       ├── tabs.tsx       # 标签页
│       ├── toast.tsx      # 提示
│       ├── video-player.tsx # 视频播放器
│       └── ...            # 其他UI组件
├── contexts/              # React Context
│   └── auth-context.tsx   # 认证上下文
├── hooks/                 # 自定义钩子
│   ├── use-cart.ts        # 购物车钩子
│   ├── use-favorites.ts   # 收藏钩子
│   ├── use-messages.ts    # 消息钩子
│   ├── use-mobile.ts      # 移动端检测钩子
│   └── use-toast.ts       # 提示钩子
├── lib/                   # 工具函数
│   ├── file-cache.ts      # 文件缓存
│   ├── file-utils.ts      # 文件工具
│   ├── image-config.ts    # 图片配置
│   ├── route-config.ts    # 路由配置
│   ├── supabase/          # Supabase配置
│   │   ├── client.ts      # 客户端配置
│   │   └── server.ts      # 服务端配置
│   ├── supabaseClient.ts  # Supabase客户端
│   └── utils.ts           # 通用工具函数
├── types/                 # TypeScript类型定义
│   ├── database.ts        # 数据库类型
│   └── product.ts         # 产品类型
├── public/                # 静态资源文件
├── local-storage/         # 本地存储
│   ├── images/            # 本地图片
│   └── temp/              # 临时文件
├── scripts/               # 脚本文件
├── styles/                # 全局样式
├── supabase/              # Supabase配置
│   ├── policies.sql       # 行级安全策略
│   ├── schemas.sql        # 数据库模式
│   └── seed.sql           # 种子数据
├── next.config.mjs        # Next.js配置文件
├── tsconfig.json          # TypeScript配置文件
├── components.json        # 组件配置文件
└── vercel.json            # Vercel部署配置
```

## 核心功能模块

### 1. 首页展示
- 轮播图展示特色内容（懒加载优化）
- 快捷访问功能区（扎染、蜡染、材料包、定制工坊）
- 精选教学课程推荐
- 文创产品展示
- 蓝染文化速读
- 搜索功能
- 消息通知系统

### 2. 教学课程系统
- 课程分类浏览（扎染、蜡染等）
- 课程详情页面
- 课程视频播放功能
- 课程学习进度跟踪
- 课程收藏功能
- 课程评价系统

### 3. 文创商店
- 产品分类展示（服饰、家居、配饰等）
- 产品详情页面
- 商品购买功能
- 产品图片画廊
- 商品搜索与筛选
- 商品收藏功能
- AI创作功能入口

### 4. AI图像生成
- 基于用户输入生成蓝染图案
- 图像编辑功能
- 作品保存与分享
- 历史作品管理

### 5. 定制工坊
- 提供个性化定制服务
- 展示定制案例和作品
- 定制流程管理
- 设计师作品展示

### 6. 材料包购买
- 提供各类蓝染所需材料包
- 详细的材料清单和使用说明
- 材料包分类展示
- 购买指南

### 7. 用户系统
- 用户注册/登录（Supabase Auth）
- 个人信息管理
- 我的课程
- 订单管理
- 收藏夹
- 消息中心
- 通知中心
- 地址管理

### 8. 购物车与结算
- 购物车管理
- 订单结算流程
- 支付成功/失败页面
- 订单状态跟踪

### 9. 文化内容
- 蓝染工艺介绍
- 历史文化背景
- 工艺流程展示
- 大师作品展示
- 文化文章

## 技术亮点

### 1. 懒加载系统
- 实现了完整的懒加载组件库，支持组件级和页面级懒加载
- 使用IntersectionObserver实现视口内加载
- 提供多种骨架屏加载状态
- 支持延迟加载和条件加载
- 图片懒加载优化

### 2. 性能监控
- 自定义性能监控系统，可追踪组件加载时间
- Web Vitals指标监控
- 资源加载监控
- 长任务检测
- 性能报告生成

### 3. 响应式设计
- 移动优先的设计理念
- 使用use-mobile钩子检测设备类型
- 适配各种屏幕尺寸
- 触摸友好的交互设计

### 4. 组件化开发
- 基于Radix UI构建的无障碍组件
- 使用CVA（Class Variance Authority）管理组件变体
- 完整的TypeScript类型支持
- 可复用的组件设计

### 5. 数据库设计
- 基于Supabase的PostgreSQL数据库
- 行级安全策略(RLS)保护数据
- 实时数据同步
- 自动备份与恢复

### 6. 文件管理
- 本地存储与云存储结合
- 文件缓存机制
- 多种文件格式支持
- 图片优化与压缩

## 数据库设计

### 主要表结构
- **profiles**: 用户信息
- **products**: 文创产品
- **courses**: 教学课程
- **favorites**: 用户收藏
- **orders**: 订单信息
- **cart**: 购物车
- **messages**: 消息系统
- **ai_generations**: AI生成记录
- **notifications**: 通知系统

## 安装与运行

### 前置要求
- Node.js 18+ 或更高版本
- npm 或 pnpm 包管理器
- Supabase账号（用于数据库和认证）

### 安装步骤
1. 克隆项目代码
2. 安装依赖
   ```bash
   npm install
   # 或使用pnpm
   pnpm install
   ```
3. 配置环境变量
   ```bash
   cp .env.example .env.local
   # 编辑.env.local，填入Supabase配置
   ```
4. 初始化数据库
   ```bash
   # Windows用户
   open-supabase.bat
   
   # 或手动执行
   npm run init-db
   ```
5. 启动开发服务器
   ```bash
   npm run dev
   # 或使用pnpm
   pnpm dev
   ```
6. 访问 http://localhost:3000 查看项目

### 构建生产版本
```bash
npm run build
# 或使用pnpm
pnpm build
```

### 部署到生产环境
```bash
npm run deploy
# 或使用部署脚本
deploy.sh  # Linux/Mac
deploy.bat # Windows
```

## 开发规范

### 1. 代码规范
- 使用TypeScript进行类型安全开发
- 遵循ESLint和Prettier代码格式化规范
- 组件使用函数式组件和Hooks
- 使用App Router架构
- 语义化命名约定

### 2. 组件开发
- 所有UI组件必须存于`components/ui/`目录
- 使用命名导出而非默认导出
- 组件props必须使用interface明确定义
- 使用CVA定义组件变体
- 组件文档注释

### 3. 状态管理
- 使用React内置状态管理
- 全局状态使用Context + useReducer
- 表单验证使用Zod + @hookform/resolvers
- 本地状态使用useState和useReducer

### 4. 样式规范
- 使用Tailwind CSS进行样式开发
- 动态类名使用clsx合并
- 禁止直接写内联样式
- 响应式设计优先

### 5. API设计
- RESTful API设计原则
- 统一的错误处理
- 请求/响应类型定义
- API文档维护

## 部署说明

### 前端部署
- 项目已配置Vercel Analytics
- 图片优化已禁用（unoptimized: true）
- 构建时忽略ESLint和TypeScript错误
- 自动部署配置

### 数据库部署
- Supabase托管数据库
- 行级安全策略配置
- 自动备份策略
- 数据迁移脚本

### 环境变量配置
```env
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# AWS S3配置（可选）
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_S3_BUCKET=your_s3_bucket_name
```

## 项目文档

### 技术文档
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - 数据库初始化指南
- [Supabase数据库配置指南.md](./Supabase数据库配置指南.md) - 详细的数据库配置说明
- [SUPABASE_PRODUCTS_SETUP.md](./SUPABASE_PRODUCTS_SETUP.md) - 产品与媒体数据初始化步骤
- [FILE_UPLOAD_GUIDE.md](./FILE_UPLOAD_GUIDE.md) - 文件上传功能实现指南
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 部署指南
- [BACKUP_RECOVERY.md](./BACKUP_RECOVERY.md) - 备份与恢复策略
- [docs/BACK_BUTTON_GUIDE.md](./docs/BACK_BUTTON_GUIDE.md) - 统一返回按钮使用指南

### 经验总结
- [AI图像生成功能实现总结.md](./AI图像生成功能实现总结.md) - AI功能实现经验
- [购物车和收藏列表功能修复经验总结.md](./购物车和收藏列表功能修复经验总结.md) - 功能修复经验
- [文化速读功能实现经验总结.md](./文化速读功能实现经验总结.md) - 文化速读与 Supabase 调试经验
- [Git版本管理与备份指南.md](./Git版本管理与备份指南.md) - 版本管理指南

## 注意事项

1. **环境配置**
   - 项目使用了一些占位图片和示例数据，实际部署时需要替换为真实内容
   - 确保正确配置所有环境变量
   - 数据库初始化是必要步骤

2. **开发建议**
   - 开发前请确保已安装依赖并了解项目结构
   - 使用TypeScript严格模式开发
   - 遵循组件开发规范

3. **性能优化**
   - 使用懒加载组件优化页面加载
   - 图片资源优化处理
   - API响应缓存策略

4. **安全考虑**
   - 所有API接口都有适当的权限验证
   - 用户输入数据验证和清理
   - 敏感信息使用环境变量管理

---

## 🔧 常见问题与解决方法

### 1. 商品详情页显示"产品不存在"

**症状**：访问 `/store/[slug]` 时页面显示"产品不存在"

**原因**：
- 数据库中产品表缺少 `slug` 字段或该字段为空
- `/api/products/[id]` 路由未正确支持 slug 查询
- 产品数据未正确初始化

**解决方法**：
1. 确认 `products` 表有 `slug` 字段（执行 `supabase/products-schema.sql`）
2. 运行 `npm run seed:products` 初始化示例产品
3. 检查 `/api/products/[id]/route.ts` 是否支持 slug 和 UUID 双重查询
4. 在浏览器访问 `/api/products/[slug]` 确认返回 200

### 2. 加入购物车失败（404/500错误）

**症状**：点击"加入购物车"按钮后报错"商品不存在或已下架"

**原因**：
- 后端 `/api/cart` 查询了不存在的字段（如 `in_stock`、`stock_quantity`）
- 产品表字段与 API 查询不匹配
- 产品 ID 格式不正确（UUID vs 数字ID）

**解决方法**：
1. 确认 `products` 表使用 `inventory` 字段存储库存（而非 `in_stock` 或 `stock_quantity`）
2. 检查 `/api/cart/route.ts` 的查询语句：
   ```typescript
   .select('id, name, price, inventory')  // 使用 inventory
   ```
3. 确保前端传递的 `product_id` 是有效的 UUID
4. 查看开发服务器终端日志，确认产品查询成功

### 3. Toast 提示不显示

**症状**：执行操作（如加入购物车、收藏）后没有任何提示弹窗

**原因**：
- 全局布局未挂载 `<Toaster />` 组件
- Toast 组件库未正确安装

**解决方法**：
1. 在 `app/layout.tsx` 中添加：
   ```tsx
   import { Toaster } from "@/components/ui/toaster"
   
   // 在 <body> 内、</ThemeProvider> 前添加
   <Toaster />
   ```
2. 确认 `hooks/use-toast.ts` 和 `components/ui/toaster.tsx` 存在
3. 重启开发服务器

### 4. 数据库字段不存在错误

**症状**：API 返回 `column "xxx" does not exist` 错误

**原因**：
- 本地 schema 文件与 Supabase 实际表结构不一致
- 未执行最新的数据库迁移脚本

**解决方法**：
1. 在 Supabase SQL Editor 重新执行相关 schema 文件：
   - `supabase/schemas.sql`（主表结构）
   - `supabase/products-schema.sql`（产品表）
   - `supabase/fix-favorites-for-courses.sql`（收藏表修复）
2. 检查 API 代码中的 `.select()` 字段是否与表结构匹配
3. 使用 Supabase Table Editor 查看实际表结构

### 5. 收藏功能报错（课程/商品）

**症状**：点击收藏按钮后报 500 错误或"违反唯一约束"

**原因**：
- `favorites` 表缺少 `course_id` 或 `item_type` 字段
- 唯一索引配置不正确

**解决方法**：
1. 执行 `supabase/fix-favorites-for-courses.sql` 修复表结构
2. 确认 `favorites` 表有以下字段：
   - `product_id` (UUID, nullable)
   - `course_id` (UUID, nullable)
   - `item_type` (TEXT, 'product' or 'course')
3. 重启开发服务器

### 6. 图片无法显示或上传失败

**症状**：商品/课程图片显示为占位图或上传后无法访问

**原因**：
- Supabase Storage bucket 未创建或权限配置错误
- 环境变量中的 bucket 名称不匹配
- 图片 URL 未正确保存到数据库

**解决方法**：
1. 在 Supabase Storage 创建 `product-media` bucket（公开访问）
2. 检查 `.env.local` 中 `SUPABASE_PRODUCT_BUCKET` 配置
3. 运行 `npm run seed:products` 上传示例图片
4. 确认 `product_media` 表正确关联产品ID和图片URL

### 7. 开发服务器启动失败

**症状**：运行 `npm run dev` 后报错或无法访问 localhost:3000

**原因**：
- 端口 3000 被占用
- 环境变量未正确配置
- 依赖包未安装或版本冲突

**解决方法**：
1. 检查 `.env.local` 文件是否存在且包含必要的 Supabase 配置
2. 删除 `node_modules` 和 `.next` 文件夹，重新安装：
   ```bash
   rm -rf node_modules .next
   npm install
   npm run dev
   ```
3. 更换端口运行：`npm run dev -- -p 3001`
4. 检查终端错误日志，根据提示解决依赖问题

### 8. 课程收藏失败（外键约束错误）

**症状**：点击课程收藏按钮后报错 `violates foreign key constraint "favorites_course_id_fkey"`

**原因**：
- 数据库中缺少课程数据
- 尝试收藏的课程 ID 不存在于 `courses` 表中
- 外键约束要求 `course_id` 必须在 `courses` 表中存在

**解决方法**：
1. 执行 `supabase/fix-courses-seed.sql` 修复课程数据：
   - 在 Supabase SQL Editor 中运行该脚本
   - 脚本会插入 8 门标准课程数据
2. 验证课程数据：
   ```sql
   SELECT COUNT(*) FROM courses;
   -- 应该返回至少 8
   ```
3. 清除浏览器缓存并刷新页面
4. 重新尝试收藏功能

**详细说明**：参见 `课程收藏失败修复指南.md`

### 9. 课程收藏后显示"未知课程"

**症状**：收藏课程后，在收藏列表中显示为"未知课程"

**原因**：
- 课程数据未正确初始化
- 前端 ID 映射逻辑缺失
- 数据库中课程记录缺少必要字段

**解决方法**：
1. 执行 `supabase/fix-courses-seed.sql` 初始化完整课程数据
2. 确认 `courses` 表包含 `title`、`instructor_name`、`thumbnail` 等字段
3. 检查 `hooks/use-favorites.ts` 中的课程数据映射逻辑
4. 清除浏览器缓存并刷新页面

---

## 最新更新

- **文章收藏功能**：完整实现文章收藏，包括 API、Hook、UI 组件，支持在文章卡片上收藏
- **课程收藏修复**：修复外键约束错误，提供完整的课程数据 seed 脚本
- **统一返回按钮**：创建 `BackButton` 组件，统一全站返回按钮的样式和行为
- **文化速读数据库迁移**：完成 20 篇蓝染文章数据迁移到 Supabase
- 完善了消息和通知系统
- 改进了用户交互体验
- 增加了AI图像生成功能
- 完善了购物车和收藏功能
- 优化了数据库结构和查询性能
- 添加了完整的错误处理机制
- 改进了移动端用户体验

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系方式

如有问题或建议，请通过以下方式联系：

- 项目Issues: [GitHub Issues](https://github.com/your-username/shishuo-lanyu/issues)
- 邮箱: your-email@example.com

---

感谢您对"世说蓝语"项目的关注和支持！让我们一起传承和发扬蓝染文化。