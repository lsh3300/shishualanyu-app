-- 修正版：收藏表扩展迁移（处理数据类型不匹配问题）
-- 步骤4修正：处理外键约束的数据类型问题

-- 先检查courses表的id字段类型
-- 如果courses表的id是TEXT类型，我们需要将course_id也设置为TEXT类型

-- 删除之前添加的course_id字段（如果存在）
ALTER TABLE favorites DROP COLUMN IF EXISTS course_id;

-- 重新添加course_id字段，使用TEXT类型（与courses表的id字段匹配）
ALTER TABLE favorites
  ADD COLUMN IF NOT EXISTS course_id TEXT REFERENCES courses(id) ON DELETE CASCADE;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_favorites_course_id ON favorites(course_id);