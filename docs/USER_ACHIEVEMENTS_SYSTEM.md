# 用户成就系统完整实施指南 🏆

**创建时间**: 2025-11-27  
**系统版本**: v1.0

---

## 📋 系统概述

用户成就系统提供完整的学习追踪、互动统计和成就展示功能，包括：

- ✅ 课程注册和进度跟踪
- ✅ 课程点赞系统
- ✅ 课程评论系统
- ✅ 用户成就数据统计
- ✅ 个人主页成就展示

---

## 🗂️ 数据库表结构

### 1. enrollments (课程注册表)
记录用户学习的课程

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 用户ID (FK) |
| course_id | UUID | 课程ID (FK) |
| status | TEXT | 状态: in_progress, completed, dropped |
| progress | INTEGER | 进度 0-100 |
| started_at | TIMESTAMPTZ | 开始时间 |
| completed_at | TIMESTAMPTZ | 完成时间 |
| last_accessed_at | TIMESTAMPTZ | 最后访问时间 |

### 2. course_likes (课程点赞表)
记录用户对课程的点赞

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 用户ID (FK) |
| course_id | UUID | 课程ID (FK) |
| created_at | TIMESTAMPTZ | 创建时间 |

**约束**: UNIQUE(user_id, course_id)

### 3. course_comments (课程评论表)
记录用户的课程评论

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 用户ID (FK) |
| course_id | UUID | 课程ID (FK) |
| content | TEXT | 评论内容 (1-500字) |
| likes_count | INTEGER | 点赞数 |
| parent_id | UUID | 父评论ID (支持回复) |
| created_at | TIMESTAMPTZ | 创建时间 |

### 4. comment_likes (评论点赞表)
记录用户对评论的点赞

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 用户ID (FK) |
| comment_id | UUID | 评论ID (FK) |
| created_at | TIMESTAMPTZ | 创建时间 |

---

## 🔧 数据库迁移步骤

### 方法1: Supabase Dashboard (推荐)

1. **访问 Supabase Dashboard**
   ```
   https://supabase.com/dashboard/project/YOUR_PROJECT_ID
   ```

2. **打开 SQL Editor**
   - 左侧菜单 → SQL Editor
   - 点击 "New query"

3. **执行迁移**
   - 打开文件：`supabase/migrations/20251127_user_achievements.sql`
   - 复制全部内容
   - 粘贴到 SQL Editor
   - 点击 "Run" 按钮

4. **验证表创建**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name IN ('enrollments', 'course_likes', 'course_comments', 'comment_likes');
   ```

### 方法2: Supabase CLI

```bash
# 确保已安装 Supabase CLI
npm install -g supabase

# 登录
supabase login

# 链接项目
supabase link --project-ref YOUR_PROJECT_REF

# 应用迁移
supabase db push
```

---

## 🌐 API 端点

### 课程注册 API

#### POST `/api/courses/[id]/enroll`
注册/开始学习课程

**请求头:**
```json
{
  "Authorization": "Bearer YOUR_TOKEN"
}
```

**响应:**
```json
{
  "message": "注册成功",
  "enrollment": {
    "id": "uuid",
    "user_id": "uuid",
    "course_id": "uuid",
    "status": "in_progress",
    "progress": 0
  }
}
```

#### PATCH `/api/courses/[id]/enroll`
更新学习进度

**请求体:**
```json
{
  "progress": 50
}
```

**响应:**
```json
{
  "message": "进度已更新",
  "enrollment": {
    "progress": 50,
    "status": "in_progress"
  }
}
```

---

### 课程点赞 API

#### POST `/api/courses/[id]/like`
点赞/取消点赞课程

**响应:**
```json
{
  "message": "点赞成功",
  "isLiked": true,
  "likesCount": 156
}
```

#### GET `/api/courses/[id]/like`
获取点赞状态

**响应:**
```json
{
  "isLiked": false,
  "likesCount": 155
}
```

---

### 课程评论 API

#### GET `/api/courses/[id]/comments`
获取课程评论列表

**查询参数:**
- `limit`: 每页数量 (默认20)
- `offset`: 偏移量 (默认0)

**响应:**
```json
{
  "comments": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "user_name": "张三",
      "avatar_url": "https://...",
      "content": "课程很棒！",
      "likes_count": 12,
      "created_at": "2025-11-27T10:00:00Z"
    }
  ],
  "total": 45,
  "limit": 20,
  "offset": 0
}
```

#### POST `/api/courses/[id]/comments`
发表评论

**请求体:**
```json
{
  "content": "这个课程讲解得非常详细！",
  "parent_id": null  // 可选，回复评论时使用
}
```

**响应:**
```json
{
  "message": "评论成功",
  "comment": {
    "id": "uuid",
    "user_name": "李四",
    "content": "这个课程讲解得非常详细！",
    "created_at": "2025-11-27T10:30:00Z"
  }
}
```

---

### 用户成就 API

#### GET `/api/user/achievements`
获取当前用户的成就数据

**响应:**
```json
{
  "user_id": "uuid",
  "completed_courses": 5,
  "in_progress_courses": 3,
  "learning_days": 15,
  "total_likes": 20,
  "total_comments": 8,
  "total_engagements": 28,
  "first_learning_date": "2025-11-01T00:00:00Z",
  "last_learning_date": "2025-11-27T10:00:00Z"
}
```

---

## 🎨 前端组件

### UserAchievements 组件

#### 简洁版 (个人主页)
```tsx
import { UserAchievements } from "@/components/user/UserAchievements"

<UserAchievements />
```

**显示内容:**
- 完成课程数
- 学习天数
- 点赞、评论总数
- 进行中的课程数

#### 详细版 (成就页面)
```tsx
import { UserAchievementsDetailed } from "@/components/user/UserAchievements"

<UserAchievementsDetailed />
```

**显示内容:**
- 完成课程数
- 进行中课程数
- 学习天数
- 点赞数
- 评论数
- 总互动数
- 学习历程时间线

---

## 🔄 课程详情页集成

### 新功能

1. **点赞功能 (真实API)**
   ```tsx
   const handleLike = async () => {
     const response = await fetch(`/api/courses/${courseId}/like`, {
       method: 'POST'
     })
     const data = await response.json()
     // 更新状态
   }
   ```

2. **评论功能 (真实API)**
   ```tsx
   const handleCommentSubmit = async () => {
     const response = await fetch(`/api/courses/${courseId}/comments`, {
       method: 'POST',
       body: JSON.stringify({ content: newComment })
     })
     // 刷新评论列表
   }
   ```

3. **开始学习按钮**
   ```tsx
   const handleStartLearning = async () => {
     const response = await fetch(`/api/courses/${courseId}/enroll`, {
       method: 'POST'
     })
     // 更新注册状态
   }
   ```

---

## 📱 个人主页集成

### 修改内容

**文件**: `app/profile/page.tsx`

**变更**:
```tsx
// 旧代码 (已移除)
<Card className="p-5">
  <h3>最近成就</h3>
  <div className="grid grid-cols-3">
    <div>完成课程: {userStats.completedCourses}</div>
    <div>学习天数: {userStats.learningDays}</div>
    <div>收藏夹: {userStats.favorites}</div>
  </div>
</Card>

// 新代码 (使用组件)
<UserAchievements />
```

**优势**:
- 自动获取真实数据
- 统一的设计风格
- 实时更新
- 加载状态管理

---

## 🧪 测试指南

### 1. 数据库表验证

```sql
-- 检查表是否创建
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%course%';

-- 检查索引
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename IN ('enrollments', 'course_likes', 'course_comments');

-- 检查RLS策略
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('enrollments', 'course_likes', 'course_comments');
```

### 2. API 测试

#### 测试点赞
```bash
# 点赞课程
curl -X POST http://localhost:3000/api/courses/COURSE_ID/like \
  -H "Authorization: Bearer YOUR_TOKEN"

# 获取点赞状态
curl http://localhost:3000/api/courses/COURSE_ID/like
```

#### 测试评论
```bash
# 发表评论
curl -X POST http://localhost:3000/api/courses/COURSE_ID/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"content": "测试评论"}'

# 获取评论
curl "http://localhost:3000/api/courses/COURSE_ID/comments?limit=10"
```

#### 测试成就
```bash
# 获取成就数据
curl http://localhost:3000/api/user/achievements \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. 前端测试清单

#### 课程详情页
- [ ] 点击课程列表的课程卡片
- [ ] 成功进入课程详情页
- [ ] 看到点赞按钮和数量
- [ ] 点击点赞按钮
- [ ] 确认点赞数增加
- [ ] 再次点击取消点赞
- [ ] 确认点赞数减少
- [ ] 滚动到评论区
- [ ] 输入评论内容
- [ ] 点击发表评论
- [ ] 确认评论出现在列表中
- [ ] 点击"立即学习"按钮
- [ ] 确认注册成功提示

#### 个人主页
- [ ] 访问 http://localhost:3000/profile
- [ ] 登录账户
- [ ] 看到"最近成就"卡片
- [ ] 确认显示完成课程数
- [ ] 确认显示学习天数
- [ ] 确认显示点赞评论数
- [ ] 数据自动从API获取
- [ ] 有加载状态显示

---

## 🚀 部署步骤

### 步骤1: 执行数据库迁移
```bash
# 在 Supabase Dashboard SQL Editor 执行
supabase/migrations/20251127_user_achievements.sql
```

### 步骤2: 清理缓存并重启
```powershell
# 清理 Next.js 缓存
Remove-Item -Recurse -Force .next

# 重启开发服务器
npm run dev
```

### 步骤3: 验证API
访问测试页面验证所有API正常工作

### 步骤4: 用户测试
- 注册/登录账户
- 学习课程
- 点赞和评论
- 查看成就数据

---

## 📊 数据流程图

```
用户操作
   ↓
前端组件 (React)
   ↓
API Route (Next.js)
   ↓
Supabase Client
   ↓
PostgreSQL 数据库
   ↓
RLS 权限检查
   ↓
数据返回
   ↓
前端更新状态
   ↓
UI 反馈
```

---

## 🔒 安全特性

1. **RLS (Row Level Security)**
   - 用户只能查看/修改自己的数据
   - 评论和点赞对所有人可见
   - 敏感操作需要身份验证

2. **API 身份验证**
   - 所有写操作需要登录
   - Token 验证
   - 401 未授权自动跳转

3. **数据验证**
   - 评论长度限制 (1-500字)
   - 进度值范围限制 (0-100)
   - 防止 SQL 注入

---

## 🐛 常见问题

### Q1: 迁移执行失败
**A**: 检查：
- Supabase 连接正常
- 有足够的权限
- 没有表名冲突
- SQL 语法正确

### Q2: API 返回 401
**A**: 检查：
- 用户是否已登录
- Token 是否有效
- Cookie 设置正确

### Q3: 成就数据显示为 0
**A**: 检查：
- 数据库迁移是否执行
- RLS 策略是否正确
- API 是否正常返回
- 用户是否有数据

### Q4: 评论无法提交
**A**: 检查：
- 评论内容不为空
- 长度不超过 500 字
- 用户已登录
- 网络连接正常

---

## 📈 后续优化建议

### 短期 (1周内)
1. [ ] 添加评论点赞功能
2. [ ] 实现评论回复
3. [ ] 添加评论删除
4. [ ] 优化加载性能

### 中期 (1个月)
1. [ ] 添加成就徽章系统
2. [ ] 实现排行榜
3. [ ] 添加学习时长统计
4. [ ] 实现学习提醒

### 长期 (3个月)
1. [ ] AI 学习助手
2. [ ] 个性化推荐
3. [ ] 社交功能扩展
4. [ ] 数据分析看板

---

## 📚 相关文件

### 数据库
- `supabase/migrations/20251127_user_achievements.sql`

### API
- `app/api/courses/[id]/enroll/route.ts`
- `app/api/courses/[id]/like/route.ts`
- `app/api/courses/[id]/comments/route.ts`
- `app/api/user/achievements/route.ts`

### 组件
- `components/user/UserAchievements.tsx`
- `app/teaching/[id]/page.tsx` (已更新)
- `app/profile/page.tsx` (已更新)

### 文档
- `docs/USER_ACHIEVEMENTS_SYSTEM.md` (本文档)

---

**系统状态**: ✅ 就绪  
**创建者**: AI Assistant  
**最后更新**: 2025-11-27
