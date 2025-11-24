# v1.1.2 版本恢复指南

## 恢复概述
本文档提供了从 v1.1.2 备份版本恢复项目的详细步骤。按照以下指南操作，可以确保项目能够正确地从备份状态恢复并正常运行。

## 环境准备

### 必要的软件环境
- **Node.js**: 18.x 或更高版本
- **npm/yarn/pnpm**: 最新稳定版本
- **Git**: 2.30.0 或更高版本
- **PostgreSQL**: 14.x 或更高版本（如果不使用 Supabase 托管）

### 系统要求
- **操作系统**: Windows, macOS, Linux
- **内存**: 至少 4GB RAM
- **存储空间**: 至少 1GB 可用空间

## 恢复步骤

### 1. 克隆代码仓库
```bash
git clone [仓库地址] sslyapp
cd sslyapp
```

### 2. 检出 v1.1.2 标签
```bash
git checkout v1.1.2
```

### 3. 安装依赖
根据您使用的包管理器，选择以下命令之一：

```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install

# 或使用 pnpm
pnpm install
```

### 4. 配置环境变量
复制环境变量模板文件，并根据您的环境配置相应的值：

```bash
# 从备份目录复制环境变量模板
cp backup/v1.1.2/.env.example .env.local
```

然后编辑 `.env.local` 文件，填充所有必要的配置值，特别是：
- Supabase 配置（URL 和密钥）
- 数据库连接信息
- 其他必要的服务配置

### 5. 初始化数据库

#### 使用 Supabase CLI（推荐）
```bash
# 确保您已安装 Supabase CLI
supabase login
# 链接到您的 Supabase 项目
supabase link --project-ref [your-project-ref]
# 应用迁移
supabase migration up
# 应用种子数据
supabase seed run
```

#### 手动执行 SQL 脚本
如果您不使用 Supabase CLI，可以手动执行项目中的 SQL 脚本：

```bash
# 使用 psql 连接到您的数据库
psql -h [host] -U [user] -d [dbname] -f supabase/schemas.sql
psql -h [host] -U [user] -d [dbname] -f supabase/seed.sql
```

### 6. 修复数据库外键和 RLS 策略
应用特定于 v1.1.2 版本的数据库修复：

```bash
psql -h [host] -U [user] -d [dbname] -f supabase/fix-likes-comments-foreign-keys.sql
psql -h [host] -U [user] -d [dbname] -f supabase/fix-likes-comments-rls.sql
psql -h [host] -U [user] -d [dbname] -f supabase/add-performance-indexes.sql
```

### 7. 启动开发服务器
```bash
npm run dev
# 或 yarn dev
# 或 pnpm dev
```

服务器应该在 http://localhost:3000 启动。

### 8. 验证应用功能
打开浏览器访问 http://localhost:3000，验证以下核心功能是否正常工作：
- 用户注册/登录
- 文化文章浏览与收藏
- 产品浏览与购物车
- 点赞和评论功能
- 个人中心

## 功能验证清单
- [ ] 用户认证系统正常
- [ ] 文化文章内容显示正确
- [ ] 文章收藏功能正常工作
- [ ] 点赞功能可以正常使用
- [ ] 评论系统可以发布和显示评论
- [ ] 评论点赞功能正常
- [ ] 购物车功能运行正常
- [ ] 产品和课程详情页显示完整
- [ ] API 端点响应正确

## 常见问题解决

### 1. 环境变量配置错误
**症状**: 应用无法连接到数据库或其他服务
**解决方案**: 检查 `.env.local` 文件中的配置值是否正确，特别是 API 密钥和连接字符串。

### 2. 依赖安装失败
**症状**: `npm install` 或类似命令失败
**解决方案**: 尝试清除 npm 缓存并重新安装：
```bash
npm cache clean --force
npm install
```
或尝试使用不同的包管理器。

### 3. 数据库迁移失败
**症状**: 数据库迁移命令返回错误
**解决方案**: 确保您的数据库连接配置正确，并且具有足够的权限执行迁移。检查迁移日志以获取具体错误信息。

### 4. 应用启动后显示空白页面
**症状**: 浏览器中显示空白页面或错误信息
**解决方案**: 检查浏览器控制台的错误信息，通常是由于缺少环境变量或 API 连接问题导致的。

## 生产环境部署
如果您需要将此版本部署到生产环境，请参考项目根目录下的 `DEPLOYMENT.md` 文件获取详细的部署指南。

## 恢复验证
恢复完成后，建议执行以下操作来验证恢复是否成功：
1. 运行应用的自动化测试（如果有）
2. 手动测试关键用户流程
3. 检查日志文件中是否有错误信息
4. 验证数据库连接和数据完整性

## 注意事项
- 在恢复前，请确保已备份当前的项目和数据库状态
- 不要在生产环境中直接执行恢复操作，应先在测试环境中验证
- 如果您有任何疑问或遇到问题，请参考项目文档或联系技术支持