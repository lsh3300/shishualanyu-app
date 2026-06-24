-- 最终修复：禁用 article_favorites 的 RLS
-- API层已经有用户认证，不需要RLS
-- 在 Supabase SQL Editor 中执行此脚本

BEGIN;

-- 删除所有现有策略
DROP POLICY IF EXISTS "Users read own favorites" ON public.article_favorites;
DROP POLICY IF EXISTS "Users insert own favorites" ON public.article_favorites;
DROP POLICY IF EXISTS "Users delete own favorites" ON public.article_favorites;
DROP POLICY IF EXISTS "Users can view own article favorites" ON public.article_favorites;
DROP POLICY IF EXISTS "Users can insert own article favorites" ON public.article_favorites;
DROP POLICY IF EXISTS "Users can delete own article favorites" ON public.article_favorites;
DROP POLICY IF EXISTS "Service role can manage article favorites" ON public.article_favorites;

-- 禁用 RLS（因为API层已有认证保护）
ALTER TABLE public.article_favorites DISABLE ROW LEVEL SECURITY;

COMMIT;

-- 验证 RLS 已禁用
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'article_favorites';
-- rowsecurity 应该是 false
