# 世说蓝语 v1.0.7 版本备份

## 备份信息
- **版本号**: v1.0.7
- **备份日期**: 2024年12月19日
- **Git提交**: 9c95b4c
- **项目状态**: 功能完善版本

## 项目概述
"世说蓝语"是一个专注于蓝染文化传承的数字平台，基于Next.js 14.2.16和Supabase构建，提供教学课程、文创产品销售、AI创作等功能。

## 主要功能模块

### 1. 教学课程系统
- 课程展示与分类
- 在线报名与学习
- 课程进度跟踪
- 教师信息管理

### 2. 文创商城
- 产品展示与分类
- 购物车和收藏功能
- 订单管理系统
- 支付集成

### 3. AI创作工坊
- AI图像生成
- 个性化定制
- 设计模板库
- 作品分享

### 4. 文化内容
- 蓝染历史介绍
- 工艺技术解析
- 文化故事分享
- 传承人访谈

## 技术架构

### 前端技术栈
- **框架**: Next.js 14.2.16 (App Router)
- **语言**: TypeScript 5
- **样式**: Tailwind CSS
- **UI组件**: Radix UI系列组件
- **状态管理**: React Context + Hooks
- **动画**: Framer Motion
- **图标**: Lucide React

### 后端技术栈
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **存储**: Supabase Storage
- **API**: Next.js API Routes
- **文件存储**: AWS S3 (可选)

### 开发工具
- **包管理**: npm
- **代码检查**: ESLint
- **测试**: Playwright
- **构建**: Next.js内置

## 数据库结构

### 核心表结构
1. **profiles** - 用户配置文件
2. **products** - 产品信息
3. **orders** - 订单信息
4. **order_items** - 订单项
5. **courses** - 课程信息
6. **enrollments** - 课程注册
7. **cart_items** - 购物车
8. **favorites** - 收藏夹
9. **addresses** - 用户地址
10. **messages** - 消息系统
11. **notifications** - 通知系统

## 项目结构
```
sslyapp/
├── app/                    # Next.js App Router
│   ├── api/               # API路由
│   ├── cart/              # 购物车页面
│   ├── checkout/          # 结账页面
│   ├── courses/           # 课程页面
│   ├── profile/           # 用户中心
│   ├── store/             # 商城页面
│   └── page.tsx           # 首页
├── components/            # React组件
│   ├── templates/         # 页面模板
│   ├── ui/               # UI组件
│   └── providers/        # 状态管理提供者
├── hooks/                 # 自定义Hooks
├── lib/                   # 工具函数
├── public/               # 静态资源
├── scripts/              # 脚本文件
├── supabase/             # 数据库相关
├── types/                # TypeScript类型定义
└── data/                 # 数据文件
```

## 主要更新内容 (v1.0.7)
- ✅ 完善购物车和收藏系统功能
- ✅ 优化产品详情页和课程页面
- ✅ 改进图片加载和性能优化
- ✅ 修复API接口和用户交互
- ✅ 添加产品数据初始化脚本
- ✅ 优化移动端用户体验
- ✅ 完善错误处理和状态管理

## 备份内容
- 完整源代码
- 数据库结构文件
- 产品数据种子文件
- 配置文件模板
- 部署文档

## 恢复说明
如需恢复到该版本，请执行以下步骤：
1. 检出Git提交: `git checkout 9c95b4c`
2. 安装依赖: `npm install`
3. 配置环境变量
4. 初始化数据库: `npm run seed:products`
5. 启动开发服务器: `npm run dev`

## 注意事项
- 该备份包含完整的项目代码和数据库结构
- 环境变量文件需要单独配置
- 生产环境需要配置Supabase服务
- 图片资源需要配置存储服务

---
**备份完成时间**: 2024-12-19 16:30:00
**备份人员**: AI Assistant
**项目状态**: 可正常运行