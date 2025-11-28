# 课程视频上传和集成指南

## 概述

本文档记录了将课程教学视频上传到 Supabase Storage 并集成到课程详情页的完整流程。

## 背景

- **压缩视频目录**：`整理后课堂实践作品/压缩后教程视频`
- **视频数量**：63 个
- **总大小**：约 200 MB
- **文件格式**：`作者-课程名_ultra.mp4`（极限压缩版本）
- **单个文件大小**：1.5 - 5 MB

## 修改内容

### 1. 数据库修改

**文件**：`supabase/migrations/20251128_add_video_url_to_courses.sql`

添加了 `video_url` 字段到 `courses` 表，用于存储视频 URL。

```sql
ALTER TABLE courses ADD COLUMN IF NOT EXISTS video_url TEXT;
COMMENT ON COLUMN courses.video_url IS '课程视频URL（Supabase Storage）';
```

**执行方式**：
- 可以通过上传脚本自动执行
- 或在 Supabase SQL Editor 中手动执行

### 2. Storage 配置

**Bucket 名称**：`course-videos`

**配置**：
- 公开访问（public: true）
- 文件大小限制：50MB
- 内容类型：video/mp4

### 3. 课程详情页修改

**文件**：`app/teaching/[id]/page.tsx`

**修改内容**：
- 更新视频播放器逻辑，优先显示 `video_url`
- 使用 HTML5 `<video>` 标签支持视频播放
- 保留封面图作为视频 poster
- 向后兼容：如果没有视频，仍显示封面图

**播放逻辑**：
1. 如果有 `video_url`：显示视频播放器（带封面图作为 poster）
2. 如果没有 `video_url` 但有封面图：显示封面图和播放按钮提示
3. 如果都没有：显示占位符

### 4. 上传脚本

**文件**：`scripts/upload-course-videos.js`

**功能**：
1. 执行数据库迁移（添加 `video_url` 字段）
2. 创建 `course-videos` bucket（如果不存在）
3. 扫描压缩视频目录
4. 解析文件名（作者-课程名）
5. 查找匹配的课程记录
6. 上传视频到 Supabase Storage
7. 更新课程记录的 `video_url`

**文件命名规则**：
- 输入：`作者-课程名_ultra.mp4`
- Storage 路径：`{course.slug}_{原文件名}`
- 例如：`abc123_张三-扎染基础_ultra.mp4`

**匹配逻辑**：
1. 优先精确匹配：`instructor = 作者 AND title LIKE '%课程名%'`
2. 如果失败，尝试标题匹配：`title LIKE '%课程名%'`

## 使用步骤

### 1. 前置条件

确保 `.env.local` 包含：
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

### 2. 运行上传脚本

```bash
node scripts/upload-course-videos.js
```

### 3. 验证结果

脚本会输出：
- ✅ 成功上传的视频数量
- ⚠️ 未匹配到课程的视频
- ❌ 上传失败的视频

### 4. 测试播放

1. 启动开发服务器：`npm run dev`
2. 访问任一课程详情页：`/teaching/{course_id}`
3. 确认视频播放器正常显示并可以播放

## 注意事项

### Supabase 免费版限制

- **存储空间**：1 GB
- **带宽**：5 GB/月
- **当前使用**：约 200 MB 视频
- **剩余空间**：约 800 MB

### 性能优化

1. **视频已极限压缩**：
   - 分辨率：640px 宽
   - 编码：H.264, CRF 35
   - 音频：AAC 64kbps 单声道
   - 平均体积：3-4 MB/视频

2. **播放器优化**：
   - 使用 `preload="metadata"` 只加载元数据
   - 设置封面图作为 poster
   - 延迟加载，用户点击后才播放

3. **API 限流**：
   - 脚本每上传 5 个文件暂停 2 秒
   - 避免触发 Supabase API 限流

### 常见问题

**Q: 如果视频未匹配到课程怎么办？**

A: 检查脚本输出的未匹配列表，可能原因：
- 课程数据库中不存在该作者或课程名
- 文件名格式不符合 `作者-课程名_ultra.mp4`
- 课程名称拼写不一致

解决方法：
1. 检查数据库中的课程记录
2. 手动调整视频文件名或课程名称
3. 重新运行上传脚本

**Q: 视频播放器不显示怎么办？**

A: 检查：
1. 浏览器控制台是否有错误
2. 课程记录的 `video_url` 字段是否正确
3. Supabase Storage bucket 是否设置为公开访问
4. 视频 URL 是否可以直接访问

**Q: 如何更新视频？**

A: 
1. 上传新视频到 Storage（使用相同的文件名会自动覆盖）
2. 或手动更新课程记录的 `video_url`

## 未来改进

1. **流媒体优化**：
   - 考虑使用 HLS 或 DASH 协议
   - 支持多分辨率自适应

2. **CDN 加速**：
   - 配置 Supabase 的 CDN
   - 或使用 Cloudflare R2 + CDN

3. **播放器增强**：
   - 添加播放速度控制
   - 添加字幕支持
   - 添加播放进度记录

4. **批量管理**：
   - 创建管理界面批量上传/更新视频
   - 自动匹配和关联课程

## 相关文件

- 数据库迁移：`supabase/migrations/20251128_add_video_url_to_courses.sql`
- 上传脚本：`scripts/upload-course-videos.js`
- 课程详情页：`app/teaching/[id]/page.tsx`
- 本文档：`docs/COURSE_VIDEO_UPLOAD_GUIDE.md`

## 版本历史

- **v1.0** (2025-11-28)：初始版本，支持视频上传和播放
