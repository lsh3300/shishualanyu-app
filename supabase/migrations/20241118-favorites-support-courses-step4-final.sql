-- 步骤4修正版：删除并重新添加course_id字段为UUID类型，然后创建外键约束

-- 删除现有的course_id字段（TEXT类型）
ALTER TABLE favorites DROP COLUMN IF EXISTS course_id;

-- 重新添加course_id字段为UUID类型
ALTER TABLE favorites ADD COLUMN course_id UUID;

-- 创建外键约束
ALTER TABLE favorites 
ADD CONSTRAINT favorites_course_id_fkey 
FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;

-- 创建course_id索引
CREATE INDEX IF NOT EXISTS idx_favorites_course_id ON favorites(course_id);