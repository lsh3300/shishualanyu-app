# 世说蓝语 v1.0.8 版本恢复指南

## 快速恢复步骤

### 1. 环境准备
```bash
# 确保已安装Node.js (18.x或更高版本)
node --version

# 确保已安装Git
git --version
```

### 2. 克隆项目和切换版本
```bash
# 克隆项目到本地
git clone [你的项目地址]

# 进入项目目录
cd sslyapp

# 切换到v1.0.8版本
git checkout v1.0.8
```

### 3. 安装依赖
```bash
# 安装项目依赖
npm install

# 或使用其他包管理器
# yarn install
# pnpm install
```

### 4. 环境配置
```bash
# 复制环境变量模板
cp backup/v1.0.8/.env.example .env.local

# 编辑环境变量文件，填入你的配置
# Windows:
notepad .env.local
# macOS/Linux:
# nano .env.local
```

### 5. 数据库设置
确保你的Supabase项目已创建，并配置以下环境变量：
```
NEXT_PUBLIC_SUPABASE_URL=你的Supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的匿名密钥
SUPABASE_SERVICE_ROLE_KEY=你的服务角色密钥
```

### 6. 启动应用
```bash
# 启动开发服务器
npm run dev

# 应用将在 http://localhost:3000 启动
```

## 详细配置说明

### Supabase配置
1. **创建Supabase项目**
   - 访问 [https://supabase.com](https://supabase.com)
   - 创建新项目
   - 复制项目URL和密钥

2. **数据库表结构**
   - 执行 `supabase/schemas.sql` 中的SQL脚本
   - 确保所有必需的表和关系已创建

3. **Row Level Security (RLS)**
   - 为所有用户相关的表启用RLS
   - 配置适当的访问策略

### 环境变量详解

#### 必需配置
```bash
# Next.js应用
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=你的Supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的匿名密钥
SUPABASE_SERVICE_ROLE_KEY=你的服务角色密钥
```

#### 可选配置
```bash
# AWS S3 (文件存储)
AWS_ACCESS_KEY_ID=你的AWS访问密钥
AWS_SECRET_ACCESS_KEY=你的AWS秘密密钥
AWS_REGION=你的AWS区域
S3_BUCKET_NAME=你的S3存储桶名称

# 支付 (Stripe)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=你的Stripe发布密钥
STRIPE_SECRET_KEY=你的Stripe秘密密钥

# 邮件服务
SMTP_HOST=你的SMTP主机
SMTP_PORT=你的SMTP端口
SMTP_USER=你的SMTP用户名
SMTP_PASS=你的SMTP密码

# AI服务
OPENAI_API_KEY=你的OpenAI API密钥
```

### 功能验证

#### 搜索功能测试
1. **基本搜索**
   - 访问搜索页面 `/search`
   - 输入关键词进行搜索
   - 验证搜索结果准确性

2. **搜索建议**
   - 测试实时搜索建议
   - 验证建议内容相关性

3. **搜索结果**
   - 测试搜索结果分页
   - 验证结果展示格式

#### 核心功能测试
1. **用户认证**
   - 注册新用户
   - 登录和登出
   - 密码重置

2. **购物车功能**
   - 添加产品到购物车
   - 更新购物车数量
   - 删除购物车项目

3. **收藏功能**
   - 收藏产品
   - 查看收藏列表
   - 取消收藏

4. **产品浏览**
   - 浏览产品分类
   - 查看产品详情
   - 筛选和排序

### 常见问题解决

#### 数据库连接问题
```bash
# 检查Supabase状态
ping your-project.supabase.co

# 验证环境变量
echo $NEXT_PUBLIC_SUPABASE_URL
```

#### 搜索功能异常
```bash
# 检查搜索API
npm run dev
# 访问 http://localhost:3000/api/search?q=测试

# 检查数据库索引
# 确保产品表有适当的搜索索引
```

#### 构建失败
```bash
# 清理缓存
rm -rf node_modules .next
npm install
npm run build
```

### 生产环境部署

#### Vercel部署
1. 连接GitHub仓库到Vercel
2. 配置环境变量
3. 设置构建命令：`npm run build`
4. 设置输出目录：`.next`

#### 自定义部署
```bash
# 构建项目
npm run build

# 启动生产服务器
npm start
```

### 备份和恢复

#### 创建备份
```bash
# 创建数据库备份
supabase db dump --schema public > backup.sql

# 创建项目备份
git tag v1.0.8-backup
git push origin v1.0.8-backup
```

#### 恢复备份
```bash
# 恢复数据库
supabase db restore backup.sql

# 恢复项目版本
git checkout v1.0.8-backup
```

## 技术支持

### 相关文档
- [Next.js文档](https://nextjs.org/docs)
- [Supabase文档](https://supabase.com/docs)
- [Tailwind CSS文档](https://tailwindcss.com/docs)

### 项目结构
```
sslyapp/
├── app/                    # Next.js应用目录
│   ├── api/               # API路由
│   ├── search/            # 搜索页面
│   ├── store/             # 商店页面
│   ├── cart/              # 购物车
│   ├── profile/           # 用户中心
│   └── auth/              # 认证页面
├── components/            # React组件
├── lib/                   # 工具函数
├── types/                 # TypeScript类型
└── public/               # 静态资源
```

---
**恢复指南版本**: v1.0.8  
**最后更新**: 2024年12月20日