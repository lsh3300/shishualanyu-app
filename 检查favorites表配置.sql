-- 检查 favorites 表的RLS配置（它能正常工作）
-- 在 Supabase SQL Editor 中执行

-- 1. 检查 favorites 表的RLS状态
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'favorites';

-- 2. 查看 favorites 表的所有策略
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
WHERE tablename = 'favorites';

-- 3. 检查 article_favorites 表的RLS状态
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'article_favorites';

-- 4. 查看 article_favorites 表的所有策略
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
