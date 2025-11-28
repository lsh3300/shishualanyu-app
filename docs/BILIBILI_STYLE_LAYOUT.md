# B站风格布局设计文档

## 📱 设计参考

参考B站移动端视频详情页的简洁布局，去除营销元素，保持原有配色风格。

---

## 🎨 布局结构

### 1. Header（顶部导航）
```
┌────────────────────────────┐
│ ← 课程详情                  │
└────────────────────────────┘
```
- 返回按钮
- 标题
- 固定在顶部（sticky）

### 2. 视频播放器
```
┌────────────────────────────┐
│                            │
│      [播放按钮]            │
│                            │
└────────────────────────────┘
```
- 16:9 宽高比
- 黑色背景
- 居中播放按钮

### 3. 讲师信息（紧跟视频下方）
```
┌────────────────────────────┐
│ 👤 讲师名                   │
│    蓝染工艺讲师    [开始学习]│
└────────────────────────────┘
```
- 头像（圆形）
- 讲师名称 + 简介
- 操作按钮（开始学习）

### 4. 标题和统计
```
标题文字标题文字标题文字

👁️ 500  📅 2025-11-27  ⏱️ 30分钟
```
- 标题（较大字号）
- 统计数据（观看、日期、时长）

### 5. 标签
```
[蓝染] [手工艺] [传统文化]
```
- Badge组件
- 横向排列

### 6. 操作按钮（类B站）
```
┌──────┬──────┬──────┬──────┐
│  👍  │  ❤️  │  💬  │  📤  │
│ 123  │ 收藏 │  45  │ 分享 │
└──────┴──────┴──────┴──────┘
```
- 4列网格
- 图标 + 文字/数字
- Hover效果

### 7. Tabs（简介/评论）
```
简介    评论 45
━━━━    ─────
```
- 下划线样式
- 简洁设计

---

## 🎨 关键设计特点

### ✅ 保留的功能
1. ✅ 点赞/取消点赞
2. ✅ 收藏/取消收藏
3. ✅ 评论/删除评论
4. ✅ 分享功能
5. ✅ 开始学习
6. ✅ Console日志
7. ✅ Toast提示

### ❌ 移除的内容
1. ❌ 课程亮点卡片
2. ❌ 限时免费营销
3. ❌ 价格卡片
4. ❌ "你将学到"模块
5. ❌ 章节列表（可后续添加）
6. ❌ 复杂渐变背景

### 🎨 设计简化
1. 纯色背景（background）
2. 简洁的卡片
3. 统一的间距
4. 扁平化按钮

---

## 📐 详细布局

### Header
```tsx
<header className="bg-card border-b sticky top-0 z-50 backdrop-blur-sm bg-card/95">
  <div className="flex items-center gap-4 p-4">
    <Button variant="ghost" size="icon" onClick={() => router.back()}>
      <ArrowLeft className="h-5 w-5" />
    </Button>
    <h1 className="font-semibold flex-1 line-clamp-1">课程详情</h1>
  </div>
</header>
```
- 毛玻璃效果
- 边框分隔
- 固定顶部

### 视频播放器
```tsx
<div className="relative w-full aspect-video bg-black">
  <Image />
  <Button className="rounded-full h-16 w-16">
    <Play />
  </Button>
</div>
```
- aspect-video（16:9）
- 黑色背景
- 圆形播放按钮

### 讲师信息
```tsx
<div className="flex items-center gap-3">
  <Avatar className="h-12 w-12" />
  <div className="flex-1">
    <div className="font-medium">{course.instructor}</div>
    <div className="text-sm text-muted-foreground">蓝染工艺讲师</div>
  </div>
  <Button size="sm">开始学习</Button>
</div>
```
- 横向布局
- 头像+信息+按钮
- 对齐清晰

### 标题
```tsx
<h2 className="text-lg font-semibold leading-tight mb-2">
  {course.title}
</h2>
```
- 较大字号
- 粗体
- 紧凑行高

### 统计信息
```tsx
<div className="flex items-center gap-4 text-sm text-muted-foreground">
  <span className="flex items-center gap-1">
    <Eye className="h-4 w-4" />
    500
  </span>
  <span className="flex items-center gap-1">
    <Calendar className="h-4 w-4" />
    2025-11-27
  </span>
  <span className="flex items-center gap-1">
    <Clock className="h-4 w-4" />
    30分钟
  </span>
</div>
```
- 横向排列
- 小图标
- 灰色文字

### 操作按钮
```tsx
<div className="grid grid-cols-4 gap-2">
  <button className="flex flex-col items-center gap-1 py-2 rounded-lg hover:bg-accent">
    <ThumbsUp className="h-5 w-5" />
    <span className="text-xs">123</span>
  </button>
  {/* 收藏、评论、分享 */}
</div>
```
- 4列网格
- 纵向布局（图标+文字）
- Hover背景色

### Tabs
```tsx
<TabsList className="w-full justify-start h-12 bg-transparent border-b rounded-none p-0">
  <TabsTrigger 
    value="intro" 
    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
  >
    简介
  </TabsTrigger>
  <TabsTrigger value="comments">
    评论 {comments.length}
  </TabsTrigger>
</TabsList>
```
- 透明背景
- 底部边框
- 激活态下划线

### 简介内容
```tsx
<TabsContent value="intro" className="mt-4 space-y-4">
  <div className="text-sm leading-relaxed text-muted-foreground">
    {course.description}
  </div>
</TabsContent>
```
- 简单文本
- 灰色
- 行间距适中

### 评论区
```tsx
<TabsContent value="comments" className="mt-4 space-y-4">
  {/* 发表评论 */}
  <Card>
    <CardContent className="pt-6 space-y-3">
      <textarea />
      <Button>发表评论</Button>
    </CardContent>
  </Card>
  
  {/* 评论列表 */}
  <div className="space-y-4">
    {comments.map(comment => (
      <div className="flex gap-3">
        <Avatar />
        <div className="flex-1">
          <div>{comment.user_name}</div>
          <p>{comment.content}</p>
          <button>👍 {comment.likes_count}</button>
        </div>
      </div>
    ))}
  </div>
</TabsContent>
```
- 头像+内容
- 扁平化设计
- 简洁布局

---

## 🎨 样式细节

### 颜色
- 背景：`bg-background`
- 卡片：`bg-card`
- 边框：`border`
- 主色：`text-primary`
- 次要：`text-muted-foreground`

### 间距
- padding: `p-4`（主要内容区）
- gap: `gap-3`（元素间距）
- space-y: `space-y-4`（垂直间距）

### 圆角
- 按钮：`rounded-lg`
- 头像：`rounded-full`
- 播放按钮：`rounded-full`

### 字体
- 标题：`text-lg font-semibold`
- 正文：`text-sm`
- 辅助：`text-xs text-muted-foreground`

---

## 📱 响应式设计

所有布局都是响应式的：
- 使用flex布局
- gap和padding自适应
- 文字自动换行

---

## 🎯 与B站的相似点

1. ✅ 视频在顶部
2. ✅ 讲师信息紧跟视频
3. ✅ 标题简洁明了
4. ✅ 统计数据横向排列
5. ✅ 4个操作按钮（点赞/收藏/评论/分享）
6. ✅ 简介和评论分开
7. ✅ 评论区扁平化设计

---

## 🎯 与原版的区别

| 项目 | 原版 | B站风格 |
|------|------|---------|
| 营销内容 | ✅ 有（亮点、价格） | ❌ 无 |
| 章节列表 | ✅ 有 | ❌ 无 |
| 讲师统计 | ✅ 有 | ❌ 无 |
| 布局复杂度 | 复杂 | 简洁 |
| 渐变背景 | ✅ 有 | ❌ 无 |
| Tab数量 | 4个 | 2个 |
| 操作按钮 | 横向大按钮 | 网格图标按钮 |

---

## ✅ 功能完整性

**100%保留所有核心功能**

### API调用
- ✅ `/api/courses/[id]/like` - 点赞
- ✅ `/api/courses/[id]/comments` - 评论
- ✅ `/api/courses/[id]/comments/[commentId]` - 删除评论
- ✅ `/api/courses/[id]/enroll` - 开始学习
- ✅ 收藏功能（useFavorites hook）

### 用户交互
- ✅ 点赞按钮（带状态）
- ✅ 收藏按钮（带状态）
- ✅ 评论输入和提交
- ✅ 删除自己的评论
- ✅ 分享功能
- ✅ 开始学习按钮

### 反馈提示
- ✅ Toast提示
- ✅ Console日志
- ✅ 登录检查
- ✅ 确认对话框（删除时）

---

## 🎨 视觉对比

### 原版
```
┌─────────────────────────┐
│  渐变Header              │
├─────────────────────────┤
│  视频（渐变背景）        │
├─────────────────────────┤
│  标题 + 评分 + 统计      │
│  [点赞] [收藏] [评论]    │
├─────────────────────────┤
│  🌟 课程亮点（4卡片）    │
├─────────────────────────┤
│  💰 价格卡片             │
├─────────────────────────┤
│  [介绍][章节][讲师][评论]│
└─────────────────────────┘
```

### B站风格
```
┌─────────────────────────┐
│  简洁Header              │
├─────────────────────────┤
│  视频（纯黑背景）        │
├─────────────────────────┤
│  👤 讲师 [开始学习]      │
│  标题                    │
│  👁️ 📅 ⏱️               │
│  [标签]                  │
├─────────────────────────┤
│  👍  ❤️  💬  📤         │
│  123  收藏  45  分享     │
├─────────────────────────┤
│  简介    评论 45         │
│  ━━━━                   │
│  内容区域                │
└─────────────────────────┘
```

---

## 🚀 使用方法

1. **刷新浏览器** - Ctrl + Shift + R
2. **访问课程详情页**
3. **查看新布局**：
   - 顶部：简洁Header
   - 视频：黑色背景
   - 讲师：头像+名称+按钮
   - 标题：清晰大字
   - 操作：4个图标按钮
   - 内容：简介/评论分开

---

## 🎯 总结

### 设计理念
- **简洁至上** - 去除营销元素
- **内容优先** - 突出课程本身
- **扁平化** - 现代简约风格
- **功能完整** - 所有功能正常

### 适合场景
- 注重内容体验
- 不需要营销展示
- 类似视频平台风格
- 移动端友好

---

**B站风格布局已应用，保持原有配色和功能！** 📱
