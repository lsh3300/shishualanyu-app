-- 删除旧表（如果需要重建）
-- DROP TABLE IF EXISTS course_chapters CASCADE;
-- DROP TABLE IF EXISTS courses CASCADE;

-- 创建课程表
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  instructor_name TEXT,
  instructor_bio TEXT,
  instructor_avatar TEXT,
  duration TEXT,
  students INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0,
  price DECIMAL(10,2),
  is_free BOOLEAN DEFAULT false,
  difficulty TEXT,
  category TEXT,
  thumbnail TEXT,
  status TEXT DEFAULT 'published',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 添加缺失的列（如果表已存在）
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'instructor_avatar') THEN
    ALTER TABLE courses ADD COLUMN instructor_avatar TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'difficulty') THEN
    ALTER TABLE courses ADD COLUMN difficulty TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'thumbnail') THEN
    ALTER TABLE courses ADD COLUMN thumbnail TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'status') THEN
    ALTER TABLE courses ADD COLUMN status TEXT DEFAULT 'published';
  END IF;
END $$;

-- 创建课程章节表
CREATE TABLE IF NOT EXISTS course_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  duration TEXT,
  is_free BOOLEAN DEFAULT false,
  position INTEGER DEFAULT 0,
  video_url TEXT,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 修改 favorites 表，添加 course_id 支持
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'favorites' AND column_name = 'course_id'
  ) THEN
    ALTER TABLE favorites ADD COLUMN course_id UUID REFERENCES courses(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 修改 favorites 表的约束，确保 product_id 和 course_id 至少有一个
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'favorites' AND constraint_name = 'favorites_item_check'
  ) THEN
    ALTER TABLE favorites ADD CONSTRAINT favorites_item_check 
      CHECK (
        (product_id IS NOT NULL AND course_id IS NULL) OR 
        (product_id IS NULL AND course_id IS NOT NULL)
      );
  END IF;
END $$;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_course_chapters_course_id ON course_chapters(course_id);
CREATE INDEX IF NOT EXISTS idx_favorites_course_id ON favorites(course_id);

-- 添加更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at 
  BEFORE UPDATE ON courses 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_course_chapters_updated_at ON course_chapters;
CREATE TRIGGER update_course_chapters_updated_at 
  BEFORE UPDATE ON course_chapters 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 添加注释
COMMENT ON TABLE courses IS '课程表';
COMMENT ON TABLE course_chapters IS '课程章节表';
COMMENT ON COLUMN favorites.course_id IS '收藏的课程ID';
