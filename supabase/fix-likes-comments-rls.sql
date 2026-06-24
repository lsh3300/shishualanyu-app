-- ============================================
-- 修复点赞评论功能的 RLS 策略
-- ============================================
-- 
-- 问题：API 使用 Service Client 进行操作，但 Service Client 
-- 无法通过 auth.uid() 获取用户上下文，导致 RLS 检查失败
-- 
-- 解决方案：修改 RLS 策略，使其与 API 认证机制兼容
-- API 已经在应用层验证了用户身份，因此可以信任 Service Client 的操作
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

-- 所有人可以查看点赞（用于显示点赞数）
CREATE POLICY "Anyone can view likes"
  ON public.likes
  FOR SELECT
  USING (true);

-- 认证用户可以添加点赞（通过 API 验证）
CREATE POLICY "Authenticated users can insert likes"
  ON public.likes
  FOR INSERT
  WITH CHECK (
    -- 允许通过 auth.uid() 验证的用户（客户端）
    (auth.uid() = user_id)
    OR
    -- 允许 Service Role（API 服务器已验证用户身份）
    (auth.jwt() ->> 'role' = 'service_role')
  );

-- 用户可以删除自己的点赞
CREATE POLICY "Users can delete own likes"
  ON public.likes
  FOR DELETE
  USING (
    -- 允许通过 auth.uid() 验证的用户（客户端）
    (auth.uid() = user_id)
    OR
    -- 允许 Service Role（API 服务器已验证用户身份）
    (auth.jwt() ->> 'role' = 'service_role')
  );

-- ====== comments 表策略 ======

-- 所有人可以查看已发布的评论
CREATE POLICY "Anyone can view published comments"
  ON public.comments
  FOR SELECT
  USING (status = 'published');

-- 认证用户可以添加评论（通过 API 验证）
CREATE POLICY "Authenticated users can insert comments"
  ON public.comments
  FOR INSERT
  WITH CHECK (
    -- 允许通过 auth.uid() 验证的用户（客户端）
    (auth.uid() = user_id AND auth.uid() IS NOT NULL)
    OR
    -- 允许 Service Role（API 服务器已验证用户身份）
    (auth.jwt() ->> 'role' = 'service_role')
  );

-- 用户可以更新自己的评论
CREATE POLICY "Users can update own comments"
  ON public.comments
  FOR UPDATE
  USING (
    -- 允许通过 auth.uid() 验证的用户（客户端）
    (auth.uid() = user_id)
    OR
    -- 允许 Service Role（API 服务器已验证用户身份）
    (auth.jwt() ->> 'role' = 'service_role')
  )
  WITH CHECK (
    -- 允许通过 auth.uid() 验证的用户（客户端）
    (auth.uid() = user_id)
    OR
    -- 允许 Service Role（API 服务器已验证用户身份）
    (auth.jwt() ->> 'role' = 'service_role')
  );

-- 用户可以删除自己的评论
CREATE POLICY "Users can delete own comments"
  ON public.comments
  FOR DELETE
  USING (
    -- 允许通过 auth.uid() 验证的用户（客户端）
    (auth.uid() = user_id)
    OR
    -- 允许 Service Role（API 服务器已验证用户身份）
    (auth.jwt() ->> 'role' = 'service_role')
  );

-- ====== comment_likes 表策略 ======

-- 所有人可以查看评论点赞
CREATE POLICY "Anyone can view comment likes"
  ON public.comment_likes
  FOR SELECT
  USING (true);

-- 认证用户可以添加评论点赞（通过 API 验证）
CREATE POLICY "Authenticated users can insert comment likes"
  ON public.comment_likes
  FOR INSERT
  WITH CHECK (
    -- 允许通过 auth.uid() 验证的用户（客户端）
    (auth.uid() = user_id)
    OR
    -- 允许 Service Role（API 服务器已验证用户身份）
    (auth.jwt() ->> 'role' = 'service_role')
  );

-- 用户可以删除自己的评论点赞
CREATE POLICY "Users can delete own comment likes"
  ON public.comment_likes
  FOR DELETE
  USING (
    -- 允许通过 auth.uid() 验证的用户（客户端）
    (auth.uid() = user_id)
    OR
    -- 允许 Service Role（API 服务器已验证用户身份）
    (auth.jwt() ->> 'role' = 'service_role')
  );

COMMIT;

-- ====== 验证策略 ======
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename IN ('likes', 'comments', 'comment_likes')
ORDER BY tablename, policyname;
