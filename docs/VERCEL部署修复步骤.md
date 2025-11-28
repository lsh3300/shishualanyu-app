# Vercel 部署修复步骤

## 问题现象
- Vercel 部署后访问显示 404 NOT_FOUND
- `vercel inspect` 显示只构建了一个 API 路由，没有构建 Next.js 页面
- 本地 `npm run build` 完全正常，构建了 60+ 个页面

## 问题根因
Vercel 项目设置中可能有错误配置（例如 Output Directory 被设置为 `out`），导致 Vercel 把项目当成静态站点而不是 Next.js SSR 应用。

## 修复步骤

### 方案 1：修改 Vercel 项目设置（推荐）

1. 打开浏览器，访问：https://vercel.com/lsh3300s-projects/shishualanyu-app

2. 点击 **Settings** 标签页

3. 在左侧菜单选择 **Build & Development Settings**

4. 确认/修改以下设置：
   - **Framework Preset**：选择 `Next.js`（如果不是，改成这个）
   - **Build Command**：保持 `npm run build` 或留空
   - **Output Directory**：**必须留空**或删除任何值（如果有 `out`、`.next` 等，全部删除）
   - **Install Command**：保持 `npm install` 或留空

5. 点击 **Save** 保存设置

6. 回到项目首页，点击右上角 **Redeploy** → **Use existing Build Cache** → 点击 **Redeploy**

7. 等待构建完成（约 1-2 分钟）

8. 访问：https://shishualanyu-app.vercel.app

### 方案 2：删除项目重新创建（如果方案 1 无效）

1. 在 Vercel Dashboard 删除现有项目：
   - 进入项目 Settings → Advanced → Delete Project

2. 本地重新链接：
   ```bash
   cd c:\Users\lsh\Desktop\sslyapp
   vercel link
   ```
   - 选择 **Create a new project**
   - 输入项目名：`shishualanyu-app`

3. 部署：
   ```bash
   vercel --prod
   ```

## 验证部署成功

访问 https://shishualanyu-app.vercel.app，应该看到：
- 顶部有"世说蓝语"logo 和搜索栏
- 轮播图显示"传承千年的蓝染工艺"等内容
- 下方有"教学精选"、"文创臻品"、"文化速读"模块
- 底部有导航栏（首页、商城、教学、文化、我的）

**不应该看到**：
- 404 NOT_FOUND 错误
- 蓝色的"世说蓝语启动面板"（那是本地启动页，不应该出现在线上）

## 检查构建状态

部署后，在本地运行：
```bash
vercel inspect https://shishualanyu-app.vercel.app
```

正常的 Builds 输出应该包含很多条目，例如：
```
Builds
  ┌ . [xxxms]
  ├── λ / (Page)
  ├── λ /store (Page)
  ├── λ /teaching (Page)
  ├── λ /api/cart (Function)
  └── ... (还有很多其他页面和 API)
```

**不正常的输出**（当前状态）：
```
Builds
  ┌ . [0ms]
  └── λ api/upload (298.61KB) [iad1]
```
只有一个 API 路由说明配置有问题。

## 注意事项

1. 确保 Vercel 环境变量已正确设置：
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY`

2. 不要在项目根目录放任何 HTML 文件（已移到 `local-launcher/` 目录）

3. 本地 `npm run build` 能成功，说明代码没问题，只是 Vercel 项目设置的问题
