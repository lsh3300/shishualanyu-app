# 🔒 点赞评论功能 - RLS 策略修复指南

## 🔴 当前问题

### 错误信息
```
添加点赞失败: {
  code: '42501',
  message: 'new row violates row-level security policy for table "likes"'
}

发布评论失败: {
  code: '42501',
  message: 'new row violates row-level security policy for table "comments"'
}
```

### 问题原因

**RLS（行级安全）策略阻止了 Service Client 的操作**

1. **现有 RLS 策略**：
   ```sql
   WITH CHECK (auth.uid() = user_id)
   ```

2. **问题**：
   - API 使用 `Service Client`（Service Role Key）进行数据库操作
   - Service Client 没有用户会话上下文
   - `auth.uid()` 在 Service Client 模式下返回 `NULL`
   - RLS 策略检查失败，拒绝插入操作

3. **为什么会这样**：
   - 我们已经在 API 层（`authenticateUser` 函数）验证了用户身份
   - 但数据库的 RLS 策略不知道 API 已经验证过用户
   - RLS 策略仍然尝试用 `auth.uid()` 检查，导致失败

---

## ✅ 解决方案

### 修改 RLS 策略，同时支持：
1. **客户端直连**：使用 `auth.uid()` 验证
2. **API Server（Service Client）**：允许 `service_role` 通过

新的策略逻辑：
```sql
WITH CHECK (
  -- 选项1：客户端直接操作（使用用户 token）
  (auth.uid() = user_id)
  OR
  -- 选项2：通过 API Server（已在应用层验证用户）
  (auth.jwt() ->> 'role' = 'service_role')
)
```

---

## 📋 执行步骤

### 步骤 1：在 Supabase SQL Editor 中执行修复脚本

1. **访问 Supabase Dashboard**
   - 登录 https://supabase.com/dashboard
   - 选择你的项目

2. **打开 SQL Editor**
   - 左侧菜单点击 "SQL Editor"
   - 点击 "New query"

3. **复制并执行以下 SQL**

```sql
-- ============================================
-- 修复点赞评论功能的 RLS 策略
-- ============================================

BEGIN;

-- ====== 1. 删除现有的 RLS 策略 ======

-- likes 表
DROP POLICY IF EXISTS "Anyone can view likes" ON public.likes;
DROP POLICY IF EXISTS "Users can insert own likes" ON public.likes;
DROP POLICY IF EXISTS "Users can delete own likes" ON public.likes;

-- comments 表
DROP POLICY IF EXISTS "Anyone can view published comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;

-- comment_likes 表
DROP POLICY IF EXISTS "Anyone can view comment likes" ON public.comment_likes;
DROP POLICY IF EXISTS "Users can insert own comment likes" ON public.comment_likes;
DROP POLICY IF EXISTS "Users can delete own comment likes" ON public.comment_likes;

-- ====== 2. 创建新的 RLS 策略（支持 Service Client） ======

-- ====== likes 表策略 ======

CREATE POLICY "Anyone can view likes"
  ON public.likes
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert likes"
  ON public.likes
  FOR INSERT
  WITH CHECK (
    (auth.uid() = user_id) OR (auth.jwt() ->> 'role' = 'service_role')
  );

CREATE POLICY "Users can delete own likes"
  ON public.likes
  FOR DELETE
  USING (
    (auth.uid() = user_id) OR (auth.jwt() ->> 'role' = 'service_role')
  );

-- ====== comments 表策略 ======

CREATE POLICY "Anyone can view published comments"
  ON public.comments
  FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authenticated users can insert comments"
  ON public.comments
  FOR INSERT
  WITH CHECK (
    (auth.uid() = user_id AND auth.uid() IS NOT NULL) OR (auth.jwt() ->> 'role' = 'service_role')
  );

CREATE POLICY "Users can update own comments"
  ON public.comments
  FOR UPDATE
  USING (
    (auth.uid() = user_id) OR (auth.jwt() ->> 'role' = 'service_role')
  )
  WITH CHECK (
    (auth.uid() = user_id) OR (auth.jwt() ->> 'role' = 'service_role')
  );

CREATE POLICY "Users can delete own comments"
  ON public.comments
  FOR DELETE
  USING (
    (auth.uid() = user_id) OR (auth.jwt() ->> 'role' = 'service_role')
  );

-- ====== comment_likes 表策略 ======

CREATE POLICY "Anyone can view comment likes"
  ON public.comment_likes
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert comment likes"
  ON public.comment_likes
  FOR INSERT
  WITH CHECK (
    (auth.uid() = user_id) OR (auth.jwt() ->> 'role' = 'service_role')
  );

CREATE POLICY "Users can delete own comment likes"
  ON public.comment_likes
  FOR DELETE
  USING (
    (auth.uid() = user_id) OR (auth.jwt() ->> 'role' = 'service_role')
  );

COMMIT;
```

4. **点击 "Run"** 或按 `Ctrl+Enter`

5. **确认成功**
   - 应该看到 "Success. No rows returned"
   - 如果有错误，请复制错误信息

---

### 步骤 2：无需重启服务器

修复的是数据库策略，不需要重启 Next.js 服务器。

---

### 步骤 3：测试功能

1. **确保已登录**（如果没有，访问 /auth 登录）

2. **测试点赞**：
   - 访问任意课程详情页
   - 点击点赞按钮
   - ✅ 应该成功，无 500 错误

3. **测试评论**：
   - 在评论框输入内容
   - 点击发布
   - ✅ 应该成功，评论显示在列表

4. **测试其他功能**：
   - ✅ 编辑评论
   - ✅ 删除评论
   - ✅ 给评论点赞

---

## 🔍 技术说明

### 什么是 RLS（Row Level Security）？

**RLS 是 PostgreSQL 的行级安全功能**，可以：
- 控制用户对每一行数据的访问权限
- 在数据库层面强制执行安全策略
- 防止未授权的数据访问

### 为什么需要修改 RLS 策略？

**我们的架构**：
```
浏览器 → API Routes (验证用户) → Service Client → 数据库
```

**问题**：
1. API Routes 使用 `Service Client`（Service Role Key）
2. Service Client 是服务器端客户端，没有用户会话
3. RLS 策略检查 `auth.uid()` 时返回 `NULL`
4. 插入操作被拒绝

**解决方案**：
- 修改 RLS 策略，允许 `service_role` 执行操作
- 因为 API 已经验证了用户身份（`authenticateUser` 函数）
- 数据库信任来自 API 的操作

### 安全性说明

**这样安全吗？** ✅ **是的！**

1. **API 层已验证用户**：
   - `authenticateUser` 函数检查 token
   - 确保只有登录用户才能操作
   - 验证 user_id 匹配

2. **Service Role Key 保护**：
   - `SUPABASE_SERVICE_KEY` 只存在服务器端
   - 客户端无法访问
   - 只有 API Routes 可以使用

3. **双重保护**：
   - **应用层**：API 验证用户身份
   - **数据库层**：RLS 策略检查 service_role

4. **API 代码已经确保安全**：
   ```typescript
   // API 中的验证逻辑
   const { user, error: authError } = await authenticateUser(request)
   if (authError || !user) {
     return NextResponse.json({ error: '未登录' }, { status: 401 })
   }
   
   // 插入时使用验证过的 user.id
   await supabase.from('likes').insert({
     user_id: user.id,  // ✅ 已验证的用户 ID
     item_type,
     item_id,
   })
   ```

---

## 🎯 预期结果

### 成功的标志

**浏览器控制台**：
- ✅ `POST /api/likes 200` 或 `201`
- ✅ `POST /api/comments 201`
- ✅ 无 500 错误
- ✅ Toast 提示"点赞成功"、"评论发布成功"

**服务器终端**：
- ✅ `POST /api/likes 200 in XXXms`
- ✅ `POST /api/comments 201 in XXXms`
- ✅ 无 RLS policy violation 错误
- ✅ 无 42501 错误码

**功能表现**：
- ✅ 点赞后按钮变红
- ✅ 点赞数正确增加
- ✅ 评论立即显示在列表
- ✅ 可以编辑、删除评论
- ✅ 可以给评论点赞

---

## 🧪 验证 RLS 策略

执行 SQL 后，可以运行此查询验证策略：

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename IN ('likes', 'comments', 'comment_likes')
ORDER BY tablename, policyname;
```

应该看到每个表都有正确的策略。

---

## 🔄 回滚（如果需要）

如果需要回滚到原始策略：

```sql
BEGIN;

-- 删除新策略
DROP POLICY IF EXISTS "Anyone can view likes" ON public.likes;
DROP POLICY IF EXISTS "Authenticated users can insert likes" ON public.likes;
DROP POLICY IF EXISTS "Users can delete own likes" ON public.likes;

-- 恢复原始策略
CREATE POLICY "Users can insert own likes"
  ON public.likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ... 其他表的原始策略 ...

COMMIT;
```

---

## 📚 相关文档

- ✅ `点赞评论功能-Token认证修复完成.md` - Token 认证修复
- ✅ `点赞评论功能-认证问题修复完成.md` - API 认证修复
- ✅ `点赞评论功能-完整修复步骤.md` - 完整修复指南
- ✅ `supabase/fix-likes-comments-rls.sql` - RLS 修复脚本

---

## 🎊 总结

**问题链**：
1. ✅ 数据库外键引用错误 → **已修复**
2. ✅ item_id 类型不匹配 → **已修复**
3. ✅ API 认证逻辑错误 → **已修复**
4. ✅ 前端缺少 Authorization token → **已修复**
5. 🔧 **RLS 策略阻止 Service Client** → **现在修复**

**执行 SQL 脚本后，所有功能将完全正常！** 🚀

---

**现在立即执行 SQL 脚本，然后测试功能！**
