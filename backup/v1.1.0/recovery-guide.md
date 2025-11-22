# v1.1.0 版本恢复指南

## 恢复概述
本文档提供了从v1.1.0版本备份恢复项目的详细步骤。请按照以下说明操作，确保正确恢复项目环境和数据。

## 环境准备

### 1. 系统要求
- **操作系统**: Windows, macOS, Linux
- **Node.js**: 16.x 或更高版本
- **npm**: 8.x 或更高版本
- **Git**: 2.30.x 或更高版本
- **PostgreSQL**: 可通过Supabase或本地安装

### 2. 安装依赖
```bash
# 安装Node.js和npm（如果尚未安装）
# Windows: https://nodejs.org/en/download/
# macOS: brew install node
# Linux: sudo apt install nodejs npm

# 验证安装
node -v
npm -v
```

## 恢复步骤

### 1. 克隆项目
```bash
# 如果需要重新克隆项目
mkdir -p C:\Users\lsh\Desktop
cd C:\Users\lsh\Desktop
git clone [repository-url] sslyapp
cd sslyapp

# 或者直接在现有目录中操作
cd C:\Users\lsh\Desktop\sslyapp
```

### 2. 切换到v1.1.0版本
```bash
# 检出v1.1.0标签
git checkout v1.1.0

# 验证当前版本
git describe --tags
```

### 3. 安装项目依赖
```bash
# 安装npm依赖
npm install

# 如果使用pnpm
# pnpm install
```

### 4. 配置环境变量
```bash
# 从备份中复制环境变量模板
cp backup/v1.1.0/.env.example .env.local

# 编辑.env.local文件，填写实际的配置值
# 在Windows上可以使用记事本或VS Code编辑
notepad .env.local
# 或
code .env.local
```

### 5. 数据库设置

#### 使用Supabase
1. 登录Supabase控制台
2. 创建或选择现有的项目
3. 执行必要的数据库迁移

#### 数据库迁移（如果需要）
```bash
# 使用Supabase CLI执行迁移
npx supabase db reset

# 或者手动执行SQL脚本
psql -h localhost -U postgres -d postgres -f supabase/migrations/*.sql
```

### 6. 启动项目

#### 开发模式
```bash
# 启动开发服务器
npm run dev
# 或
pnpm dev
```

#### 生产构建
```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 功能验证

### 1. 检查购物车功能
- 访问应用首页
- 添加商品到购物车
- 检查购物车页面
- 测试结算流程

### 2. 验证API端点
```bash
# 使用curl或Postman测试API
curl http://localhost:3000/api/debug/check-products-schema
```

### 3. 验证数据库连接
```bash
# 运行数据库检查脚本
node check-tables.js
```

## 常见问题解决

### 1. 依赖安装失败
- 检查Node.js和npm版本
- 清除npm缓存: `npm cache clean --force`
- 重试安装: `npm install`

### 2. 数据库连接问题
- 确认环境变量中的数据库配置正确
- 检查数据库服务是否正在运行
- 验证数据库用户权限

### 3. Supabase连接错误
- 确认SUPABASE_URL和SUPABASE_ANON_KEY正确
- 检查网络连接和防火墙设置
- 验证Supabase项目状态

### 4. 购物车功能异常
- 检查浏览器控制台错误
- 验证数据库中的cart_items表结构
- 确认购物车API路由配置正确

## 生产环境部署

### 部署到Vercel
1. 登录Vercel账户
2. 导入GitHub仓库
3. 配置环境变量（与.env.local相同）
4. 部署项目

### 部署到其他平台
- 确保设置正确的环境变量
- 配置构建命令: `npm run build`
- 配置启动命令: `npm start`

## 恢复验证

恢复完成后，请确认以下功能正常工作：

- [ ] 用户可以注册和登录
- [ ] 商品可以浏览和搜索
- [ ] 购物车功能正常工作
- [ ] 结算流程可以完成
- [ ] 课程内容可以访问
- [ ] 文件上传功能正常
- [ ] 数据库连接稳定

## 联系信息

如果在恢复过程中遇到问题，请参考项目文档或联系技术支持。

---

**文档版本**: v1.1.0
**最后更新**: 2023-11-21