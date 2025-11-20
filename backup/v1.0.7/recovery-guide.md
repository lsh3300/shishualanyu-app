# 世说蓝语 v1.0.7 版本恢复指南

## 快速恢复步骤

### 1. 环境准备
```bash
# 确保已安装Node.js 18+ 和 npm
node --version
npm --version

# 克隆或检出代码
git checkout 9c95b4c  # v1.0.7版本提交
```

### 2. 安装依赖
```bash
# 安装项目依赖
npm install

# 安装开发依赖
npm install --save-dev
```

### 3. 环境配置
```bash
# 复制环境变量模板
cp backup/v1.0.7/.env.example .env.local

# 编辑环境变量文件，填入实际配置
nano .env.local  # 或使用其他编辑器
```

### 4. 数据库设置
```bash
# 登录Supabase控制台
# 创建新数据库或连接到现有数据库
# 执行数据库结构初始化

# 使用Supabase CLI (如果已安装)
supabase db push supabase/schemas.sql

# 或者通过Supabase控制台手动执行SQL
```

### 5. 数据初始化
```bash
# 初始化产品数据
npm run seed:products

# 验证数据导入
# 检查Supabase控制台中的数据
```

### 6. 启动应用
```bash
# 开发模式
npm run dev

# 生产构建
npm run build
npm start
```

## 详细配置说明

### Supabase配置
1. **创建Supabase项目**
   - 访问 https://supabase.com
   - 创建新项目
   - 获取项目URL和密钥

2. **数据库初始化**
   - 在SQL编辑器中执行 `supabase/schemas.sql`
   - 执行 `supabase/products-schema.sql` (产品相关)

3. **认证设置**
   - 配置认证提供商 (邮箱、社交登录等)
   - 设置认证策略和规则

4. **存储设置**
   - 创建存储桶用于图片上传
   - 配置存储访问权限

### 环境变量详解

#### 必需配置
```env
# Supabase基础配置
NEXT_PUBLIC_SUPABASE_URL=你的Supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的匿名访问密钥
SUPABASE_SERVICE_ROLE_KEY=你的服务角色密钥
```

#### 可选配置
```env
# AWS S3 (文件存储)
AWS_ACCESS_KEY_ID=你的AWS访问密钥
AWS_SECRET_ACCESS_KEY=你的AWS密钥
AWS_REGION=你的AWS区域
AWS_S3_BUCKET=你的S3存储桶名称

# 支付集成 (Stripe)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=你的Stripe公钥
STRIPE_SECRET_KEY=你的Stripe私钥

# AI服务
OPENAI_API_KEY=你的OpenAI API密钥
STABILITY_API_KEY=你的Stability AI密钥
```

### 功能验证

#### 基础功能测试
1. **用户注册/登录**
   - 访问首页: http://localhost:3000
   - 测试用户注册和登录功能

2. **产品浏览**
   - 访问商城页面
   - 检查产品列表和详情页

3. **购物车功能**
   - 添加商品到购物车
   - 测试购物车更新和删除

4. **收藏功能**
   - 收藏和取消收藏产品
   - 在个人中心查看收藏

#### 高级功能测试
1. **课程系统**
   - 浏览课程列表
   - 测试课程报名功能

2. **订单管理**
   - 创建测试订单
   - 检查订单状态更新

3. **管理功能**
   - 产品管理 (添加/编辑/删除)
   - 用户管理
   - 订单处理

## 常见问题解决

### 数据库连接问题
```bash
# 检查数据库连接
npx supabase status

# 重置数据库 (谨慎使用)
npx supabase db reset
```

### 依赖安装问题
```bash
# 清理缓存
npm cache clean --force

# 重新安装依赖
rm -rf node_modules package-lock.json
npm install
```

### 构建问题
```bash
# 检查TypeScript错误
npm run type-check

# 检查ESLint错误
npm run lint

# 清理构建缓存
rm -rf .next
npm run build
```

### 性能优化
1. **图片优化**
   - 使用Next.js Image组件
   - 配置图片CDN

2. **数据库优化**
   - 添加必要的索引
   - 优化查询语句

3. **缓存策略**
   - 配置CDN缓存
   - 使用Redis缓存 (可选)

## 生产环境部署

### Vercel部署
1. 连接GitHub仓库到Vercel
2. 配置环境变量
3. 设置构建命令
4. 配置域名和SSL

### 自建服务器
1. 安装Node.js和PM2
2. 配置Nginx反向代理
3. 设置SSL证书
4. 配置进程守护

## 备份和恢复

### 定期备份
```bash
# 数据库备份
supabase db dump --schema public > backup.sql

# 文件备份
aws s3 sync s3://your-bucket backup/s3-backup/
```

### 灾难恢复
1. 从Git恢复代码
2. 从备份恢复数据库
3. 重新配置环境变量
4. 验证所有功能

## 技术支持

### 相关文档
- [Next.js文档](https://nextjs.org/docs)
- [Supabase文档](https://supabase.com/docs)
- [Tailwind CSS文档](https://tailwindcss.com/docs)

### 项目资源
- 项目README.md
- 数据库结构文档
- API接口文档

---
**恢复指南版本**: v1.0.7
**最后更新**: 2024年12月19日
**适用范围**: 世说蓝语项目v1.0.7版本