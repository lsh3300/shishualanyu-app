-- 修复 course_likes 表的 RLS 策略
-- 问题：service key 绕过RLS，但策略本身可能有问题

-- 1. 删除现有的插入策略
DROP POLICY IF EXISTS "Users can insert own likes" ON course_likes;

-- 2. 创建新的插入策略 - 使用 service_role 绕过检查
CREATE POLICY "Allow insert for authenticated users"
  ON course_likes
  FOR INSERT
  TO authenticated, service_role
  WITH CHECK (true);

-- 3. 同样修复删除策略
DROP POLICY IF EXISTS "Users can delete own likes" ON course_likes;

CREATE POLICY "Allow delete for authenticated users"
  ON course_likes
  FOR DELETE
  TO authenticated, service_role
  USING (true);

-- 4. 修复 course_comments 表
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON course_comments;

CREATE POLICY "Allow insert comments for authenticated"
  ON course_comments
  FOR INSERT
  TO authenticated, service_role
  WITH CHECK (true);

-- 5. 修复 comment_likes 表
DROP POLICY IF EXISTS "Users can insert own comment likes" ON comment_likes;

CREATE POLICY "Allow insert comment likes"
  ON comment_likes
  FOR INSERT
  TO authenticated, service_role
  WITH CHECK (true);

-- 6. 修复 enrollments 表
DROP POLICY IF EXISTS "Users can insert own enrollments" ON enrollments;

CREATE POLICY "Allow insert enrollments"
  ON enrollments
  FOR INSERT
  TO authenticated, service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own enrollments" ON enrollments;

CREATE POLICY "Allow update enrollments"
  ON enrollments
  FOR UPDATE
  TO authenticated, service_role
  USING (true);

-- 验证
COMMENT ON POLICY "Allow insert for authenticated users" ON course_likes IS 'RLS修复：允许通过service key插入';
