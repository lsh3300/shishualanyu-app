-- ============================================
-- 修复课程相关表的 course_id 字段类型
-- 问题：courses 表的 id 字段可能包含非 UUID 格式的值
-- 但 course_comments 和 course_likes 表的 course_id 是 UUID 类型
-- 解决方案：将 course_id 字段改为 TEXT 类型
-- ============================================

-- 1. 修改 course_likes 表
-- 先删除外键约束
ALTER TABLE course_likes DROP CONSTRAINT IF EXISTS course_likes_course_id_fkey;

-- 修改字段类型为 TEXT
ALTER TABLE course_likes ALTER COLUMN course_id TYPE TEXT USING course_id::TEXT;

-- 2. 修改 course_comments 表
-- 先删除外键约束
ALTER TABLE course_comments DROP CONSTRAINT IF EXISTS course_comments_course_id_fkey;

-- 修改字段类型为 TEXT
ALTER TABLE course_comments ALTER COLUMN course_id TYPE TEXT USING course_id::TEXT;

-- 3. 修改 enrollments 表（如果存在）
ALTER TABLE enrollments DROP CONSTRAINT IF EXISTS enrollments_course_id_fkey;
ALTER TABLE enrollments ALTER COLUMN course_id TYPE TEXT USING course_id::TEXT;

-- 4. 重建索引
DROP INDEX IF EXISTS idx_course_likes_course_id;
CREATE INDEX idx_course_likes_course_id ON course_likes(course_id);

DROP INDEX IF EXISTS idx_course_comments_course_id;
CREATE INDEX idx_course_comments_course_id ON course_comments(course_id);

-- 验证修改
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name IN ('course_likes', 'course_comments', 'enrollments') 
  AND column_name = 'course_id';
