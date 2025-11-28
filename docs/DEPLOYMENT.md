# 世说蓝语app - 部署指南

## 项目概述

世说蓝语app是一个基于Next.js和Supabase的蜡染艺术电商平台，提供产品展示、购买和用户管理功能。

## 技术栈

- **前端框架**: Next.js 14 (App Router)
- **UI组件**: Tailwind CSS + shadcn/ui
- **数据库**: Supabase (PostgreSQL)
- **身份验证**: Supabase Auth
- **部署平台**: Vercel

## 本地开发环境设置

### 1. 克隆项目

```bash
git clone <repository-url>
cd 世说蓝语app
```

### 2. 安装依赖

```bash
npm install
```

### 3. 设置环境变量

创建 `.env.local` 文件并添加以下变量：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. 运行开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:3000` 上运行。

## 生产环境部署 (Vercel)

### 方法一：使用部署脚本

#### Windows用户

```bash
deploy.bat
```

#### macOS/Linux用户

```bash
chmod +x deploy.sh
./deploy.sh
```

### 方法二：手动部署

1. **安装Vercel CLI**

```bash
npm install -g vercel
```

2. **登录Vercel**

```bash
vercel login
```

3. **部署项目**

```bash
vercel --prod
```

### 环境变量设置

在Vercel控制台中设置以下环境变量：

- `NEXT_PUBLIC_SUPABASE_URL`: 您的Supabase项目URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 您的Supabase匿名密钥
- `SUPABASE_SERVICE_ROLE_KEY`: 您的Supabase服务角色密钥

## 数据库设置

### 1. 创建Supabase项目

1. 访问 [Supabase](https://supabase.com)
2. 创建新项目
3. 记录项目URL和API密钥

### 2. 设置数据库表

在Supabase SQL编辑器中运行以下SQL命令创建必要的表：

```sql
-- 用户资料表
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 产品表
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 订单表
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 订单项表
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 课程表
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  instructor TEXT NOT NULL,
  duration INTEGER NOT NULL, -- 以分钟为单位
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 课程报名表
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  course_id UUID REFERENCES public.courses(id) NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);
```

### 3. 设置行级安全策略(RLS)

```sql
-- 启用RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- 用户资料表策略
CREATE POLICY "Users can view own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 订单表策略
CREATE POLICY "Users can view own orders." ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own orders." ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 订单项表策略
CREATE POLICY "Users can view own order items." ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
);

-- 课程报名表策略
CREATE POLICY "Users can view own enrollments." ON public.enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own enrollments." ON public.enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## 性能优化建议

1. **图片优化**: 使用Next.js的Image组件和CDN
2. **代码分割**: 利用Next.js的动态导入功能
3. **缓存策略**: 实现适当的API缓存
4. **数据库索引**: 为常用查询字段添加索引

## 监控和维护

1. **错误监控**: 考虑集成Sentry或类似工具
2. **性能监控**: 使用Vercel Analytics
3. **备份策略**: 定期备份Supabase数据库
4. **更新依赖**: 定期更新项目依赖

## 故障排除

### 常见问题

1. **构建失败**: 检查环境变量是否正确设置
2. **数据库连接问题**: 验证Supabase URL和密钥
3. **权限错误**: 确保RLS策略正确配置

### 获取帮助

- 查看项目文档
- 检查[Next.js文档](https://nextjs.org/docs)
- 参考[Supabase文档](https://supabase.com/docs)