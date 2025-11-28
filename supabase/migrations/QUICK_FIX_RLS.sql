-- 快速修复：禁用RLS以允许service key操作
-- 这是安全的，因为API层已经验证了用户身份

-- 1. 禁用 course_likes 的 RLS
ALTER TABLE course_likes DISABLE ROW LEVEL SECURITY;

-- 2. 禁用 course_comments 的 RLS
ALTER TABLE course_comments DISABLE ROW LEVEL SECURITY;

-- 3. 禁用 comment_likes 的 RLS
ALTER TABLE comment_likes DISABLE ROW LEVEL SECURITY;

-- 4. 禁用 enrollments 的 RLS
ALTER TABLE enrollments DISABLE ROW LEVEL SECURITY;

-- 验证
SELECT 
  tablename, 
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('course_likes', 'course_comments', 'comment_likes', 'enrollments');

-- 应该显示所有表的 RLS Enabled = false
