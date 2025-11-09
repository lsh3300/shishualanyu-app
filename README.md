# 世说蓝语 - 蓝染文化传承平台

## 项目概述
"世说蓝语"是一个专注于蓝染文化传承与推广的综合性平台，致力于将传统蓝染工艺与现代设计相结合，通过教学课程、文创产品销售和文化传播，让更多人了解和喜爱这一古老而美丽的工艺。

## 技术栈
- **前端框架**：Next.js 14.2.16 (React 18)
- **编程语言**：TypeScript 5+
- **UI组件库**：Radix UI、自定义组件
- **样式处理**：Tailwind CSS 4.1.9
- **构建工具**：Next.js内置构建系统
- **图标库**：Lucide React 0.454.0
- **表单处理**：React Hook Form 7.60.0、@hookform/resolvers 3.10.0、Zod 3.25.67
- **状态管理**：React内置状态管理
- **主题切换**：Next Themes 0.4.6
- **动画效果**：Tailwind CSS Animate、tw-animate-css
- **工具库**：Class Variance Authority、clsx、Tailwind Merge
- **数据可视化**：Recharts 2.15.4
- **日期处理**：date-fns 4.1.0
- **轮播组件**：Embla Carousel React 8.5.1
- **性能监控**：自定义性能监控系统
- **懒加载**：React.lazy + Suspense + IntersectionObserver

## 项目结构
```
├── app/                 # Next.js 14 App Router 主目录
│   ├── layout.tsx       # 根布局组件
│   ├── page.tsx         # 首页
│   ├── teaching/        # 教学课程模块
│   │   ├── page.tsx     # 课程列表页
│   │   ├── [id]/        # 课程详情页
│   │   ├── tie-dye/     # 扎染课程专题页
│   │   └── wax-resist/  # 蜡染课程专题页
│   ├── store/           # 文创商店模块
│   │   ├── page.tsx     # 商店首页
│   │   ├── [id]/        # 产品详情页
│   │   ├── custom/      # 定制工坊专题页
│   │   └── materials/   # 材料包专题页
│   ├── profile/         # 用户个人中心
│   │   ├── courses/     # 我的课程
│   │   └── orders/      # 订单管理
│   ├── cart/            # 购物车功能
│   ├── checkout/        # 结算流程
│   │   ├── cancel/      # 支付取消页面
│   │   └── success/     # 支付成功页面
│   ├── messages/        # 消息中心
│   ├── notifications/   # 通知中心
│   ├── contact/         # 联系我们
│   └── api/             # API路由
│       └── messages/    # 消息相关API
├── components/          # 组件库
│   ├── navigation/      # 导航相关组件
│   │   └── bottom-nav.tsx
│   ├── ui/              # 通用UI组件
│   │   ├── accordion.tsx
│   │   ├── address-selector.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── alert.tsx
│   │   ├── aspect-ratio.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── banner-carousel.tsx
│   │   ├── breadcrumb.tsx
│   │   ├── button.tsx
│   │   ├── calendar.tsx
│   │   ├── card.tsx
│   │   ├── carousel.tsx
│   │   ├── cart-item.tsx
│   │   ├── chart.tsx
│   │   ├── checkbox.tsx
│   │   ├── collapsible.tsx
│   │   ├── command.tsx
│   │   ├── context-menu.tsx
│   │   ├── coupon-card.tsx
│   │   ├── course-card.tsx
│   │   ├── course-list-card.tsx
│   │   ├── craftsman-story.tsx
│   │   ├── culture-article-card.tsx
│   │   ├── dialog.tsx
│   │   ├── drawer.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── filter-bar.tsx
│   │   ├── form.tsx
│   │   ├── hover-card.tsx
│   │   ├── input-otp.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── lazy-load.tsx  # 懒加载组件集合
│   │   ├── login-form.tsx
│   │   ├── material-card.tsx
│   │   ├── menubar.tsx
│   │   ├── message-item.tsx
│   │   ├── mini-profile-popover.tsx
│   │   ├── navigation-menu.tsx
│   │   ├── notification-popover.tsx
│   │   ├── optimized-image.tsx
│   │   ├── pagination.tsx
│   │   ├── payment-method.tsx
│   │   ├── performance-monitor.tsx  # 性能监控组件
│   │   ├── popover.tsx
│   │   ├── product-card.tsx
│   │   ├── product-grid-card.tsx
│   │   ├── product-image-gallery.tsx
│   │   ├── profile-menu-item.tsx
│   │   ├── progress.tsx
│   │   ├── quick-access.tsx
│   │   ├── radio-group.tsx
│   │   ├── register-form.tsx
│   │   ├── resizable.tsx
│   │   ├── scroll-area.tsx
│   │   ├── search-bar.tsx
│   │   ├── section-header.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── sidebar.tsx
│   │   ├── skeleton.tsx
│   │   ├── slider.tsx
│   │   ├── sonner.tsx
│   │   ├── spec-selector.tsx
│   │   ├── switch.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   ├── toast.tsx
│   │   ├── toaster.tsx
│   │   ├── toggle-group.tsx
│   │   ├── toggle.tsx
│   │   ├── tooltip.tsx
│   │   ├── use-mobile.tsx
│   │   ├── use-toast.ts
│   │   └── video-player.tsx
│   └── theme-provider.tsx # 主题提供者
├── hooks/               # 自定义钩子
│   ├── use-mobile.ts    # 移动端检测钩子
│   ├── use-toast.ts     # 提示信息钩子
│   └── use-messages.ts  # 消息处理钩子
├── lib/                 # 工具函数
│   ├── image-config.ts  # 图片配置
│   ├── route-config.ts  # 路由配置
│   └── utils.ts         # 通用工具函数
├── public/              # 静态资源文件
├── styles/              # 全局样式
├── next.config.mjs      # Next.js配置文件
└── tsconfig.json        # TypeScript配置文件
```

## 核心功能模块

### 1. 首页展示
- 轮播图展示特色内容
- 快捷访问功能区（扎染、蜡染、材料包、定制工坊）
- 精选教学课程推荐
- 文创产品展示
- 蓝染文化速读
- 搜索功能
- 消息通知系统

### 2. 教学课程
- 课程分类浏览（扎染、蜡染等）
- 课程详情页面
- 课程视频播放功能
- 课程学习进度跟踪

### 3. 文创商店
- 产品分类展示（服饰、家居等）
- 产品详情页面
- 商品购买功能
- 产品图片画廊

### 4. 定制工坊
- 提供个性化定制服务
- 展示定制案例和作品

### 5. 材料包购买
- 提供各类蓝染所需材料包
- 详细的材料清单和使用说明

### 6. 用户中心
- 用户登录/注册
- 个人信息管理
- 我的课程
- 订单管理
- 消息中心
- 通知中心

### 7. 购物车与结算
- 购物车管理
- 订单结算流程
- 支付成功/失败页面

### 8. 性能优化
- 懒加载组件系统
- 性能监控
- 骨架屏加载状态
- 图片优化

## 技术亮点

### 1. 懒加载系统
- 实现了完整的懒加载组件库，支持组件级和页面级懒加载
- 使用IntersectionObserver实现视口内加载
- 提供多种骨架屏加载状态
- 支持延迟加载和条件加载

### 2. 性能监控
- 自定义性能监控系统，可追踪组件加载时间
- Web Vitals指标监控
- 资源加载监控
- 长任务检测

### 3. 响应式设计
- 移动优先的设计理念
- 使用use-mobile钩子检测设备类型
- 适配各种屏幕尺寸

### 4. 组件化开发
- 基于Radix UI构建的无障碍组件
- 使用CVA（Class Variance Authority）管理组件变体
- 完整的TypeScript类型支持

## 安装与运行

### 前置要求
- Node.js 18+ 或更高版本
- npm 或 pnpm 包管理器

### 安装步骤
1. 克隆项目代码
2. 安装依赖
   ```bash
   npm install
   # 或使用pnpm
   pnpm install
   ```
3. 启动开发服务器
   ```bash
   npm run dev
   # 或使用pnpm
   pnpm dev
   ```
4. 访问 http://localhost:3001 查看项目

### 构建生产版本
```bash
npm run build
# 或使用pnpm
pnpm build
```

## 开发规范

### 1. 代码规范
- 使用TypeScript进行类型安全开发
- 遵循ESLint和Prettier代码格式化规范
- 组件使用函数式组件和Hooks
- 使用App Router架构

### 2. 组件开发
- 所有UI组件必须存于`components/ui/`目录
- 使用命名导出而非默认导出
- 组件props必须使用interface明确定义
- 使用CVA定义组件变体

### 3. 状态管理
- 使用React内置状态管理
- 全局状态使用Context + useReducer
- 表单验证使用Zod + @hookform/resolvers

### 4. 样式规范
- 使用Tailwind CSS进行样式开发
- 动态类名使用clsx合并
- 禁止直接写内联样式

## 部署说明
- 项目已配置Vercel Analytics
- 图片优化已禁用（unoptimized: true）
- 构建时忽略ESLint和TypeScript错误

## 注意事项
- 项目使用了一些占位图片和示例数据，实际部署时需要替换为真实内容
- 如需配置环境变量，请参考Next.js文档创建.env文件
- 开发前请确保已安装依赖并了解项目结构
- 移动端检测请使用hooks目录下的use-mobile.ts钩子

## 最新更新
- 实现了完整的懒加载组件系统
- 添加了性能监控功能
- 优化了首页加载性能
- 完善了消息和通知系统
- 改进了用户交互体验