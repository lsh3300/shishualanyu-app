# 用户成就系统快速启动指南 🚀

## 📋 执行清单

### ✅ 步骤 1: 执行数据库迁移

1. 访问 Supabase Dashboard
   ```
   https://supabase.com/dashboard
   ```

2. 选择你的项目 → SQL Editor → New query

3. 复制并执行以下文件内容：
   ```
   📁 supabase/migrations/20251127_user_achievements.sql
   ```

4. 点击 "Run" 执行

5. 验证表创建成功：
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('enrollments', 'course_likes', 'course_comments', 'comment_likes');
   ```
   应该看到4个表名。

---

### ✅ 步骤 2: 重启开发服务器

```powershell
# 停止当前服务器 (Ctrl + C)

# 清理缓存
Remove-Item -Recurse -Force .next

# 重新启动
npm run dev
```

---

### ✅ 步骤 3: 测试功能

#### 3.1 测试课程点赞
1. 访问 http://localhost:3000/teaching
2. 点击任意课程
3. 登录账户（如果未登录）
4. 点击"点赞"按钮
5. 确认看到"点赞成功"提示
6. 确认点赞数增加

#### 3.2 测试课程评论
1. 在课程详情页切换到"评论"标签
2. 输入评论内容
3. 点击"发表评论"
4. 确认评论出现在列表中

#### 3.3 测试成就展示
1. 访问 http://localhost:3000/profile
2. 确认看到"最近成就"卡片
3. 确认数据正确显示：
   - 完成课程: X 个
   - 学习天数: X 天
   - 点赞、评论: X 次

---

## 🎯 核心文件

| 类型 | 文件路径 | 说明 |
|------|---------|------|
| 迁移 | `supabase/migrations/20251127_user_achievements.sql` | 数据库表结构 |
| API | `app/api/courses/[id]/enroll/route.ts` | 课程注册 |
| API | `app/api/courses/[id]/like/route.ts` | 课程点赞 |
| API | `app/api/courses/[id]/comments/route.ts` | 课程评论 |
| API | `app/api/user/achievements/route.ts` | 用户成就 |
| 组件 | `components/user/UserAchievements.tsx` | 成就展示 |
| 页面 | `app/teaching/[id]/page.tsx` | 课程详情 |
| 页面 | `app/profile/page.tsx` | 个人主页 |

---

## 🔍 快速验证

### 验证API可用性

打开浏览器开发者工具 (F12)，在 Console 中执行：

```javascript
// 测试成就API
fetch('/api/user/achievements')
  .then(r => r.json())
  .then(console.log)

// 测试点赞API (替换COURSE_ID)
fetch('/api/courses/COURSE_ID/like')
  .then(r => r.json())
  .then(console.log)
```

---

## ⚠️ 常见问题快速解决

### 问题：看不到"最近成就"
**解决**: 
1. 确认已登录
2. F5 刷新页面
3. 清理浏览器缓存

### 问题：点赞后没反应
**解决**:
1. 确认已登录
2. 打开F12查看Network标签
3. 检查API请求状态
4. 确认数据库迁移已执行

### 问题：评论提交失败
**解决**:
1. 检查评论内容长度 (1-500字)
2. 确认已登录
3. 检查网络连接

---

## 📊 预期结果

### 个人主页应该显示：
```
┌─────────────────────────────┐
│ 🏆 最近成就                │
├─────────────────────────────┤
│   ⭐        📅       📈    │
│   完成课程   学习天数  点赞评论│
│     0         0        0   │
└─────────────────────────────┘
```

### 课程详情页应该有：
- 点赞按钮 (显示点赞数)
- 收藏按钮
- 评论标签页
- 评论输入框
- 评论列表

---

## 🎉 成功标志

- ✅ 数据库表创建成功
- ✅ API 正常响应
- ✅ 个人主页显示成就数据
- ✅ 课程点赞功能正常
- ✅ 课程评论功能正常
- ✅ 没有控制台错误

---

## 📞 需要帮助？

如果遇到问题，检查：

1. **Supabase 连接**
   - .env.local 文件配置正确
   - NEXT_PUBLIC_SUPABASE_URL
   - SUPABASE_SERVICE_KEY

2. **数据库迁移**
   - SQL 执行无错误
   - 表创建成功

3. **用户登录**
   - 账户已注册
   - 登录状态正常

4. **服务器运行**
   - npm run dev 无错误
   - http://localhost:3000 可访问

---

**完成时间**: 预计 15-20 分钟  
**难度级别**: ⭐⭐ 中等
