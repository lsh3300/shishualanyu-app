# 课程封面图显示问题修复记录

## 问题描述

教学课程页面（`/teaching`）中的课程卡片没有显示封面图片，只显示灰色占位符。

## 问题根源

**数据库字段与前端映射不一致**：

- **数据库字段**：`image_url` ✅（正确）
- **前端使用**：`course.thumbnail` ❌（错误）

在 `app/teaching/page.tsx` 中，数据格式化时使用了不存在的 `course.thumbnail` 字段，导致图片 URL 为空。

## 修复内容

### 1. 教学课程列表页（主要问题）
**文件**：`app/teaching/page.tsx`

**修改前**：
```typescript
thumbnail: course.thumbnail || '/placeholder.svg',
```

**修改后**：
```typescript
thumbnail: course.image_url || '/placeholder.svg',
instructor: course.instructor || course.instructor_name || '未知讲师',
isFree: course.is_free !== undefined ? course.is_free : course.price === 0,
```

### 2. 收藏 API
**文件**：`app/api/user/favorites/route.ts`

**修改前**：
```typescript
.select('id, title, description, instructor_name, duration, students, rating, price, is_free, difficulty, category, thumbnail')
```

**修改后**：
```typescript
.select('id, title, description, instructor, instructor_name, duration, students, rating, price, is_free, difficulty, category, image_url')
```

同时在映射时添加了 `thumbnail` 字段以保持兼容性：
```typescript
coursesMap[course.id] = {
  ...course,
  thumbnail: course.image_url || '/placeholder.svg'
}
```

### 3. 我的课程页面
**文件**：`app/profile/courses/page.tsx`

**接口定义**：添加 `image_url` 字段
```typescript
interface Course {
  id: string
  title: string
  image_url?: string
  thumbnail?: string // 保留兼容性
  // ...
}
```

**图片显示**：优先使用 `image_url`
```typescript
<Image
  src={course.image_url || course.thumbnail || "/placeholder.svg"}
  alt={course.title}
  fill
  className="object-cover rounded-lg"
/>
```

### 4. 管理编辑页面
**文件**：`app/admin/course-edit/page.tsx`

**修改前**：
```typescript
coverImage: course.thumbnail || course.image_url || '',
```

**修改后**：
```typescript
coverImage: course.image_url || course.thumbnail || '',
```

## 数据库验证

验证数据库中的课程记录确实有正确的字段：
```sql
SELECT id, title, image_url, video_url FROM courses LIMIT 3;
```

示例结果：
```json
{
  "id": "d1384882-0cf2-4b88-94e8-fc89dd2e3407",
  "title": "百花缭乱",
  "image_url": "https://...supabase.co/storage/v1/object/public/course-covers/mihdft79tc8o4g.png",
  "video_url": "https://...supabase.co/storage/v1/object/public/course-videos/mihdft79tc8o4g.mp4"
}
```

## 修复策略

1. **统一字段命名**：在数据获取层统一使用 `image_url`
2. **兼容性映射**：在需要的地方添加 `thumbnail` 映射以保持向后兼容
3. **优先级处理**：优先使用 `image_url`，回退到 `thumbnail`，最后使用占位符

## 影响范围

- ✅ 教学课程列表页（`/teaching`）
- ✅ 收藏功能相关 API
- ✅ 我的课程页面（`/profile/courses`）
- ✅ 管理编辑页面（`/admin/course-edit`）
- ✅ 首页课程展示（已正确使用 `image_url`）

## 测试验证

修复后需要验证：

1. **教学课程页面**：
   - 访问 `/teaching`
   - 确认所有课程卡片显示封面图

2. **课程详情页**：
   - 点击任意课程进入详情页
   - 确认封面图和视频播放器正常

3. **收藏功能**：
   - 收藏课程后访问收藏列表
   - 确认收藏的课程显示封面图

4. **首页**：
   - 访问首页
   - 确认推荐课程显示封面图

## 注意事项

1. **组件接口保持不变**：所有使用 `thumbnail` prop 的组件（如 `CourseCard`、`CourseListCard`）接口不变，只在数据映射层处理字段名转换。

2. **向后兼容**：保留对 `thumbnail` 字段的支持，确保旧数据或未更新的地方仍能工作。

3. **数据一致性**：确保所有新创建的课程都使用 `image_url` 字段存储封面图。

## 修复时间

2025-11-28

## 相关文件

- `app/teaching/page.tsx`
- `app/api/user/favorites/route.ts`
- `app/profile/courses/page.tsx`
- `app/admin/course-edit/page.tsx`
- `docs/FIX_COURSE_IMAGE_DISPLAY.md`（本文档）
