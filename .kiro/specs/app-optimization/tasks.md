# 应用优化任务列表

## 1. 性能优化

- [x] 1.1 首页数据请求合并优化
  - 将 4 个独立的数据请求合并为 Promise.all 并行请求
  - 减少请求瀑布流，提升首屏加载速度

- [x] 1.2 产品图片查询优化
  - 优化 fetchProducts 中的 N+1 查询问题
  - 使用单次查询获取所有产品图片（使用 JOIN）

- [x] 1.3 API 响应速度优化
  - 优化 /api/cart：快速解析 JWT 避免每次调用 getUser，并行查询产品和图片
  - 优化 /api/user/profile：快速解析 JWT 获取用户 ID，使用 service client
  - 优化 auth-context：缓存 session，避免重复调用 getSession

- [x] 1.4 更多 API 优化
  - 优化 /api/user/favorites：使用 Promise.all 并行查询，快速 JWT 解析
  - 优化 /api/user/stats：使用 Promise.all 并行查询，快速 JWT 解析
  - 优化 use-cart hook：增加缓存时间到 30 秒，冷却时间到 5 秒

- [x] 1.5 图片加载优化
  - 优化 OptimizedImage 组件：使用 memo 减少重渲染
  - 增加懒加载预加载距离到 200px，减少白屏
  - 对本地图片启用 Next.js 优化，外部图片使用 unoptimized
  - 添加 loading="lazy" 属性

## 2. 代码清理

- [x] 2.1 删除废弃的备份文件夹
  - 已删除 old-api-backup 文件夹
  - 已删除 old-debug-apis 文件夹

- [x] 2.2 清理测试页面
  - 已删除 app/test-api 文件夹
  - 已删除 app/test-auth 文件夹
  - 已删除 app/test-favorites 文件夹
  - 已删除 app/test-file-viewer 文件夹
  - 已删除 app/test-uuid 文件夹
  - 已删除 app/file-cache-test 文件夹
  - 已删除 app/s3-upload-demo 文件夹

- [x] 2.3 清理调试 API
  - 保留 app/api/debug（游戏系统开发需要）

## 3. 用户体验优化

- [x] 3.1 添加骨架屏组件
  - 已创建 components/ui/home-skeleton.tsx
  - 已替换首页的简单 loading 动画为骨架屏

- [x] 3.2 统一错误处理
  - 已创建 components/ui/error-state.tsx
  - 包含 ErrorState、EmptyState、NetworkError、LoadError 组件

- [x] 3.3 页面切换加载状态
  - 已创建 components/ui/page-loading.tsx
  - 添加顶部进度条，减少页面切换白屏感知
  - 已集成到 app/layout.tsx

- [x] 3.4 页面骨架屏加载状态
  - 更新 app/loading.tsx：首页骨架屏
  - 更新 app/teaching/loading.tsx：教学页骨架屏
  - 更新 app/store/loading.tsx：商店页骨架屏
  - 更新 app/profile/loading.tsx：个人中心骨架屏
  - 更新 app/cart/loading.tsx：购物车骨架屏

## 4. 缓存优化

- [x] 4.1 图片缓存优化
  - 增加 Next.js 图片缓存时间到 1 小时
  - 添加静态资源缓存响应头（1年）
  - 添加通配符 Supabase 域名支持

---

## 优化总结

### 已完成的优化：
1. **API 响应速度**：使用快速 JWT 解析，避免每次调用 getUser
2. **数据请求**：使用 Promise.all 并行请求，减少瀑布流
3. **图片加载**：优化 OptimizedImage 组件，增加预加载距离
4. **页面切换**：添加顶部进度条和骨架屏，减少白屏感知
5. **缓存策略**：增加图片和静态资源缓存时间

### 建议的后续优化：
1. 考虑使用 CDN 加速 Supabase 存储的图片
2. 对频繁访问的数据添加 Redis 缓存
3. 使用 ISR (Incremental Static Regeneration) 优化静态页面
4. 添加 Service Worker 实现离线缓存

---

**注意**: 每完成一个任务后停止，等待用户确认后再继续下一个任务。
