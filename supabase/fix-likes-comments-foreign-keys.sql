-- ============================================
-- 修复点赞和评论表的外键关系
-- 问题: 外键引用 auth.users 导致 PostgREST 无法查询
-- 解决: 改为引用 public.profiles 表
-- ============================================

BEGIN;

-- ============================================
-- 1. 修复 likes 表的外键
-- ============================================

-- 删除旧的外键约束
ALTER TABLE public.likes 
DROP CONSTRAINT IF EXISTS likes_user_id_fkey;

-- 添加新的外键约束，引用 profiles 表
ALTER TABLE public.likes 
ADD CONSTRAINT likes_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;

-- ============================================
-- 2. 修复 comments 表的外键
-- ============================================

-- 删除旧的外键约束
ALTER TABLE public.comments 
DROP CONSTRAINT IF EXISTS comments_user_id_fkey;

-- 添加新的外键约束，引用 profiles 表
ALTER TABLE public.comments 
ADD CONSTRAINT comments_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;

-- ============================================
-- 3. 修复 comment_likes 表的外键
-- ============================================

-- 删除旧的外键约束
ALTER TABLE public.comment_likes 
DROP CONSTRAINT IF EXISTS comment_likes_user_id_fkey;

-- 添加新的外键约束，引用 profiles 表
ALTER TABLE public.comment_likes 
ADD CONSTRAINT comment_likes_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;

COMMIT;

-- ============================================
-- 验证修复结果
-- ============================================

-- 查看外键约束
SELECT 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name IN ('likes', 'comments', 'comment_likes')
  AND kcu.column_name = 'user_id'
ORDER BY tc.table_name;
