# 统一返回按钮使用指南

## 概述

为了保证整个应用中返回按钮的一致性和用户体验，我们创建了统一的 `BackButton` 组件。

## 组件位置

```
components/ui/back-button.tsx
```

## 核心特性

1. **智能返回**：可以返回上一页或指定页面
2. **样式统一**：保持全站返回按钮的视觉一致性
3. **灵活配置**：支持图标模式、文本模式、多种样式变体

## 使用方式

### 1. 基础用法 - 返回上一页

```tsx
import { BackButton } from '@/components/ui/back-button'

// 使用浏览器历史记录返回
<BackButton />
```

### 2. 指定返回路径

```tsx
// 返回到特定页面（推荐用于搜索页、详情页等）
<BackButton href="/" label="返回首页" />
<BackButton href="/culture" label="返回文化速读" />
<BackButton href="/store" label="返回商店" />
```

### 3. 图标模式

```tsx
// 只显示图标，适合放在导航栏
<BackButton iconOnly />
<BackButton href="/" iconOnly />
```

### 4. 自定义样式

```tsx
// 使用不同的变体
<BackButton variant="ghost" />
<BackButton variant="outline" />
<BackButton variant="default" />

// 自定义大小
<BackButton size="sm" />
<BackButton size="lg" />

// 添加自定义类名
<BackButton className="mt-4" />
```

## 完整示例

### 文章详情页

```tsx
// app/culture/[slug]/page.tsx
import { BackButton } from '@/components/ui/back-button'

export default function ArticlePage() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-6">
        <BackButton href="/culture" label="返回文化速读" />
      </div>
      {/* 文章内容 */}
    </article>
  )
}
```

### 搜索页面

```tsx
// app/search/page.tsx
import { BackButton } from '@/components/ui/back-button'

export default function SearchPage() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40">
        <div className="flex items-center gap-4 p-4">
          <BackButton href="/" iconOnly />
          <h1>全局搜索</h1>
        </div>
      </header>
      {/* 搜索内容 */}
    </div>
  )
}
```

### 通知页面

```tsx
// app/notifications/page.tsx
import { BackButton } from '@/components/ui/back-button'

export default function NotificationsPage() {
  return (
    <div className="min-h-screen p-4">
      <div className="mb-4">
        <BackButton href="/" label="返回首页" />
      </div>
      {/* 通知列表 */}
    </div>
  )
}
```

## Props 说明

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `href` | `string` | `undefined` | 指定返回路径，如果不提供则使用浏览器历史记录返回 |
| `label` | `string` | `'返回'` | 显示的文本 |
| `iconOnly` | `boolean` | `false` | 是否只显示图标 |
| `variant` | `'default' \| 'ghost' \| 'outline' \| 'secondary' \| 'link'` | `'ghost'` | 按钮样式变体 |
| `size` | `'default' \| 'sm' \| 'lg' \| 'icon'` | `'default'` | 按钮大小 |
| `className` | `string` | `undefined` | 自定义 CSS 类名 |

## 最佳实践

### 1. 何时使用 `href` vs 浏览器返回

- **使用 `href` 指定路径**（推荐）：
  - 搜索页面 → 总是返回首页
  - 详情页 → 返回列表页
  - 子页面 → 返回父页面
  - 原因：用户体验更可预测，不依赖浏览器历史

- **使用浏览器返回**：
  - 当用户可能从多个入口进入当前页面
  - 希望保持用户的浏览历史
  - 原因：更灵活，但可能不够直观

### 2. 特殊场景处理

#### 搜索页面

```tsx
// ✅ 推荐：总是返回首页
<BackButton href="/" iconOnly />

// ❌ 不推荐：返回上一页（可能导致循环跳转）
<BackButton iconOnly />
```

#### 多级详情页

```tsx
// 文章详情页
<BackButton href="/culture" label="返回文化速读" />

// 产品详情页
<BackButton href="/store" label="返回商店" />

// 课程详情页
<BackButton href="/teaching" label="返回课程" />
```

### 3. 移动端优化

```tsx
// 在导航栏中使用图标模式
<header className="flex items-center gap-4 p-4">
  <BackButton iconOnly />
  <h1 className="flex-1">页面标题</h1>
</header>

// 在内容区域使用完整按钮
<div className="p-4">
  <BackButton href="/" label="返回首页" />
</div>
```

## 已更新的页面

以下页面已经使用统一的 `BackButton` 组件：

- ✅ `/culture/[slug]` - 文化速读详情页
- ✅ `/search` - 搜索页面
- ✅ `/notifications` - 通知中心

## 待更新的页面

以下页面建议更新为使用统一组件：

- [ ] `/store/[id]` - 商品详情页
- [ ] `/teaching/[id]` - 课程详情页
- [ ] `/indigo-game/levels/[id]` - 游戏关卡页

## 迁移指南

### 从 `Link` 迁移

```tsx
// ❌ 旧代码
<Link href="/culture" className="...">
  ← 返回文化主页
</Link>

// ✅ 新代码
<BackButton href="/culture" label="返回文化速读" />
```

### 从 `router.back()` 迁移

```tsx
// ❌ 旧代码
const router = useRouter()
<Button onClick={() => router.back()}>
  ← 返回
</Button>

// ✅ 新代码
<BackButton />
```

### 从 `router.push()` 迁移

```tsx
// ❌ 旧代码
const router = useRouter()
<Button onClick={() => router.push('/')}>
  ← 返回首页
</Button>

// ✅ 新代码
<BackButton href="/" label="返回首页" />
```

## 设计理念

1. **用户优先**：返回行为应该是可预测的
2. **一致性**：全站统一的视觉和交互体验
3. **灵活性**：支持不同场景的需求
4. **可维护性**：集中管理，易于修改和优化

## 常见问题

### Q: 什么时候使用 `href`，什么时候不用？

**A:** 
- 如果页面有明确的"父页面"，使用 `href`（如详情页返回列表页）
- 如果页面是搜索、筛选等功能页面，使用 `href="/"` 返回首页
- 如果页面可能从多个入口进入且需要保持历史，不使用 `href`

### Q: 如何在 Server Component 中使用？

**A:** `BackButton` 是 Client Component，可以直接在 Server Component 中导入使用：

```tsx
// Server Component
import { BackButton } from '@/components/ui/back-button'

export default async function Page() {
  return (
    <div>
      <BackButton href="/culture" label="返回" />
      {/* 其他内容 */}
    </div>
  )
}
```

### Q: 可以自定义图标吗？

**A:** 目前组件使用固定的 `ArrowLeft` 图标。如需自定义，可以直接修改 `back-button.tsx` 组件，或提交功能请求。

## 相关文档

- [Next.js 路由文档](https://nextjs.org/docs/app/building-your-application/routing)
- [shadcn/ui Button 组件](https://ui.shadcn.com/docs/components/button)

---

最后更新：2025-11-22
