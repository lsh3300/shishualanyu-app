-- 为 courses 表添加 video_url 字段
-- 用于存储课程视频的 Supabase Storage URL

ALTER TABLE courses ADD COLUMN IF NOT EXISTS video_url TEXT;

-- 添加注释
COMMENT ON COLUMN courses.video_url IS '课程视频URL（Supabase Storage）';
