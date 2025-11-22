# 文章收藏 RLS 策略修复

## ⚠️ 问题

文章收藏功能失败，终端显示：
```
❌ 添加文章收藏失败: {
  code: '42501',
  message: 'new row violates row-level security policy for table "article_favorites"'
}
```

## ✅ 解决方案

### 立即执行（必须！）⭐

1. **登录 Supabase Dashboard**
   - 访问 https://supabase.com/dashboard
   - 选择你的项目

2. **执行 RLS 修复脚本**
   - 进入 **SQL Editor**
   - 点击 **New query**
   - 复制粘贴 `supabase/fix-article-favorites-rls.sql` 的完整内容
   - 点击 **Run** 执行

3. **验证策略**
   - 脚本执行后会显示现有的策略
   - 应该看到 3 条策略：
     - `Users can view own article favorites`
     - `Users can insert own article favorites`
     - `Users can delete own article favorites`

---

## 🎯 已完成的功能

### 1. ✅ 收藏页面已更新
- 添加了第 3 个标签：**文章收藏**
- 📱 商品 | 🎓 课程 | 📖 文章
- 显示收藏的文章列表
- 点击跳转到文章详情页

### 2. ✅ 文章卡片收藏按钮
- 所有文章卡片上都有收藏按钮
- 悬停显示，点击收藏/取消收藏
- Toast 提示反馈

### 3. ✅ API 完全支持
- GET: 查询文章收藏
- POST: 添加文章收藏
- DELETE: 删除文章收藏

---

## 🧪 测试步骤

### 执行 RLS 脚本后：

1. **刷新浏览器**
   - 清除缓存或硬刷新（Ctrl+Shift+R）

2. **测试收藏功能**
   - 访问 `/culture`
   - 悬停任意文章卡片
   - 点击右上角爱心图标
   - ✅ 应该显示"已收藏"，不再报错

3. **查看收藏列表**
   - 访问 `/profile/favorites`
   - 点击"文章"标签
   - ✅ 应该看到刚才收藏的文章

---

## 📋 RLS 策略说明

### 为什么需要 RLS？

RLS (Row Level Security) 确保：
- 用户只能看到自己的收藏
- 用户只能添加/删除自己的收藏
- 防止未授权访问

### 修复了什么？

旧策略可能使用了错误的条件或缺少必要的权限。新策略：

```sql
-- 查看自己的收藏
CREATE POLICY "Users can view own article favorites"
  ON article_favorites
  FOR SELECT
  USING (user_id = auth.uid());

-- 添加自己的收藏
CREATE POLICY "Users can insert own article favorites"
  ON article_favorites
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- 删除自己的收藏
CREATE POLICY "Users can delete own article favorites"
  ON article_favorites
  FOR DELETE
  USING (user_id = auth.uid());
```

---

## 🚨 如果还是失败

1. **检查用户是否登录**
   ```
   确保你已经登录系统
   ```

2. **检查数据库连接**
   ```sql
   SELECT * FROM article_favorites LIMIT 1;
   ```

3. **检查 RLS 是否启用**
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename = 'article_favorites';
   -- rowsecurity 应该为 true
   ```

4. **查看具体错误**
   - 打开浏览器开发者工具
   - 查看 Network 标签
   - 找到 `/api/user/favorites` 请求
   - 查看响应详情

---

## 📁 相关文件

- ✅ **RLS 修复脚本**: `supabase/fix-article-favorites-rls.sql`
- ✅ **收藏页面**: `app/profile/favorites/page.tsx`
- ✅ **API 路由**: `app/api/user/favorites/route.ts`
- ✅ **Hook**: `hooks/use-favorites.ts`
- ✅ **文章卡片**: `components/ui/culture-article-card.tsx`

---

## ✅ 完成检查

- [ ] 执行 `fix-article-favorites-rls.sql` 脚本
- [ ] 刷新浏览器
- [ ] 测试文章收藏功能
- [ ] 查看收藏页面文章标签
- [ ] 确认不再报 RLS 错误

---

**修复时间**: 3 分钟  
**优先级**: 🔥 高（必须立即执行）  
**状态**: ⏳ 等待执行 SQL 脚本
