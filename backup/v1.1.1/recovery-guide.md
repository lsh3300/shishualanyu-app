# v1.1.1 版本恢复指南

## 恢复概述
本文档提供了从v1.1.1备份恢复世说蓝语(SSL)应用的详细步骤，包括环境准备、项目恢复和功能验证等内容。

## 环境准备

### 系统要求
- **操作系统**: Windows/Linux/macOS
- **Node.js**: v18.x 或更高版本
- **包管理器**: npm 或 pnpm
- **Git**: 最新稳定版本
- **浏览器**: Chrome/Firefox/Safari最新版本

### 开发工具
- **代码编辑器**: VS Code (推荐)
- **数据库客户端**: TablePlus 或 pgAdmin
- **终端工具**: PowerShell (Windows) 或 Terminal (macOS/Linux)

## 恢复步骤

### 1. 克隆项目代码
```bash
# 克隆仓库
git clone <repository-url>
cd ssl-app

# 切换到v1.1.1版本
git checkout v1.1.1
```

### 2. 安装依赖
```bash
# 使用 npm
npm install

# 或使用 pnpm
pnpm install
```

### 3. 配置环境变量
```bash
# 复制环境变量模板
cp backup/v1.1.1/.env.example .env.local

# 编辑 .env.local 文件，填写必要的配置项
# - Supabase URL 和 API Key
# - AWS S3 配置
# - 数据库连接信息
```

### 4. 初始化数据库
```bash
# 如果需要初始化数据库，执行以下命令
# 1. 确保已安装Supabase CLI
# 2. 登录Supabase
# 3. 运行迁移脚本
npx supabase db reset

# 或手动运行SQL脚本
psql -h <host> -U <username> -d <database> -f supabase/schemas.sql
psql -h <host> -U <username> -d <database> -f supabase/seed.sql
psql -h <host> -U <username> -d <database> -f supabase/culture-articles-schema.sql
```

### 5. 启动开发服务器
```bash
# 启动开发服务器
npm run dev

# 或使用 pnpm
pnpm dev
```

### 6. 访问应用
打开浏览器，访问 `http://localhost:3000`

## 功能验证

### 基础功能检查
- ✅ 应用首页加载正常
- ✅ 用户认证功能正常
- ✅ 文化文章浏览功能
- ✅ 产品展示功能
- ✅ 购物车功能
- ✅ 收藏系统功能
- ✅ 游戏模块功能

### 高级功能验证
1. **收藏功能测试**
   - 登录系统
   - 收藏文化文章
   - 检查收藏列表
   - 取消收藏

2. **导航功能测试**
   - 测试底部导航栏
   - 验证返回按钮功能
   - 检查页面间导航

3. **游戏模块测试**
   - 进入游戏页面
   - 测试关卡切换
   - 验证游戏功能

## 常见问题解决

### 依赖安装失败
- 确保Node.js版本正确
- 清除npm缓存: `npm cache clean --force`
- 重新安装依赖

### 数据库连接问题
- 检查环境变量配置
- 确认Supabase项目状态
- 验证数据库连接字符串

### 资源加载错误
- 检查AWS S3配置
- 验证文件存储权限
- 确认资源URL正确

### 功能不可用
- 检查功能开关配置
- 验证数据库结构完整性
- 确认相关API路由正常

## 生产环境部署

### 构建应用
```bash
npm run build
# 或
pnpm build
```

### 部署选项
- **Vercel**: 推荐的部署平台，支持Next.js最佳实践
- **Netlify**: 另一个流行的Next.js部署平台
- **Docker**: 容器化部署

### 环境配置
- 设置生产环境变量
- 配置HTTPS
- 设置适当的缓存策略

## 恢复验证

### 健康检查
- 应用加载时间
- API响应时间
- 资源加载状态

### 功能完整性
- 所有核心功能可用
- 用户数据正确加载
- 交互流程无错误

### 性能监控
- 监控页面加载性能
- 跟踪API请求响应时间
- 检查数据库查询性能

---

## 紧急联系
如遇恢复问题，请联系开发团队获取技术支持。