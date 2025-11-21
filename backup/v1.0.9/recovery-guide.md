# v1.0.9 版本恢复指南

## 环境准备
在恢复世说蓝语项目v1.0.9版本前，请确保您的系统已满足以下要求：

- **操作系统**: Windows/macOS/Linux
- **Node.js**: 18.x 或更高版本
- **npm**: 9.x 或更高版本
- **Git**: 已安装并配置
- **Supabase 账户**: 具有创建项目的权限
- **AWS 账户**: 具有S3存储桶访问权限

## 克隆项目
1. 打开终端或命令提示符
2. 导航到您想要安装项目的目录
3. 执行以下命令克隆仓库：
   ```bash
   git clone https://your-repository-url/sslyapp.git
   cd sslyapp
   ```

## 切换到v1.0.9版本
1. 执行以下命令切换到v1.0.9标签：
   ```bash
   git checkout v1.0.9
   ```

2. 验证当前版本：
   ```bash
   git describe --tags
   ```
   输出应该显示：`v1.0.9`

## 安装依赖
1. 执行以下命令安装项目依赖：
   ```bash
   npm install
   ```
   
   或者如果使用pnpm：
   ```bash
   pnpm install
   ```

## 环境配置
1. 从备份目录复制环境变量模板：
   ```bash
   cp backup/v1.0.9/.env.example .env.local
   ```

2. 编辑`.env.local`文件，填入您的实际配置值：
   - Supabase 项目URL和密钥
   - AWS S3 访问凭证
   - 其他必要的环境变量

## 数据库设置
1. 登录到Supabase控制台
2. 创建新的项目或使用现有项目
3. 根据项目需求创建必要的表结构：
   ```sql
   -- 执行项目中的数据库初始化脚本
   psql -h your-supabase-host -U your-username -d your-database -f scripts/init-all.js
   ```

4. 如果有种子数据需要导入：
   ```bash
   node scripts/seed-courses.js
   ```

## 启动项目
1. 执行以下命令启动开发服务器：
   ```bash
   npm run dev
   ```

2. 打开浏览器访问：`http://localhost:3000`

## 功能验证
恢复后，建议验证以下关键功能：

1. **用户认证**
   - 注册新用户
   - 登录现有用户
   - 密码重置功能

2. **产品功能**
   - 浏览产品列表
   - 查看产品详情
   - 测试搜索功能

3. **教程功能**
   - 浏览教程列表
   - 查看教程详情
   - 测试收藏功能

4. **购物车**
   - 添加产品到购物车
   - 管理购物车项目

## 常见问题解决

### 数据库连接错误
- 检查`.env.local`中的Supabase配置是否正确
- 验证网络连接是否正常
- 确认Supabase项目是否处于活跃状态

### 依赖安装失败
- 尝试清除npm缓存：`npm cache clean --force`
- 确保Node.js版本符合要求
- 检查网络连接是否正常

### API调用失败
- 确认环境变量中的API URL配置正确
- 检查相关服务是否正常运行
- 查看控制台错误信息进行排查

## 生产环境部署

### Vercel部署步骤
1. 将代码推送到GitHub仓库
2. 登录Vercel并连接GitHub账户
3. 导入项目并配置环境变量
4. 完成部署配置并点击部署

### Docker部署
1. 创建Dockerfile（如需要）
2. 构建Docker镜像
3. 运行Docker容器并挂载必要的卷

## 恢复验证
完成恢复后，请运行以下检查以确保系统完整性：

```bash
# 运行测试（如项目有测试）
npm test

# 检查依赖版本兼容性
npm ls
```

## 联系支持
如在恢复过程中遇到任何问题，请联系技术支持团队获取帮助。