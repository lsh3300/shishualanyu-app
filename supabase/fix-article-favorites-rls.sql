-- 修复文章收藏的 RLS 策略
-- 在 Supabase SQL Editor 中执行此脚本

BEGIN;

-- 删除历史策略
DROP POLICY IF EXISTS "Users read own favorites" ON public.article_favorites;
DROP POLICY IF EXISTS "Users insert own favorites" ON public.article_favorites;
DROP POLICY IF EXISTS "Users delete own favorites" ON public.article_favorites;

-- 删除当前策略，便于脚本重复执行
DROP POLICY IF EXISTS "Users can view own article favorites" ON public.article_favorites;
DROP POLICY IF EXISTS "Users can insert own article favorites" ON public.article_favorites;
DROP POLICY IF EXISTS "Users can delete own article favorites" ON public.article_favorites;
DROP POLICY IF EXISTS "Service role can manage article favorites" ON public.article_favorites;

-- 重新创建正确的 RLS 策略

-- 1. 用户可以读取自己的收藏
CREATE POLICY "Users can view own article favorites"
  ON public.article_favorites
  FOR SELECT
  USING (user_id = auth.uid());

-- 2. 用户可以添加自己的收藏
CREATE POLICY "Users can insert own article favorites"
  ON public.article_favorites
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- 3. 用户可以删除自己的收藏
CREATE POLICY "Users can delete own article favorites"
  ON public.article_favorites
  FOR DELETE
  USING (user_id = auth.uid());

-- 4. Service role 可以完全管理（供API使用）
CREATE POLICY "Service role can manage article favorites"
  ON public.article_favorites
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 确保 RLS 已启用
ALTER TABLE public.article_favorites ENABLE ROW LEVEL SECURITY;

COMMIT;

-- 验证策略
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
WHERE tablename = 'article_favorites';
