-- 步骤4：添加外键约束
ALTER TABLE favorites
  ADD CONSTRAINT favorites_course_id_fkey
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;