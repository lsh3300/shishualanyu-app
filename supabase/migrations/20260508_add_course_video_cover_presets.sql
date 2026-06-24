-- 为“有视频但无封面”的课程补三张展示封面
-- 执行后会把封面路径写入 courses.image_url / courses.thumbnail

ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS thumbnail TEXT;

WITH target_courses AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY created_at ASC NULLS LAST, id) AS rn
  FROM public.courses
  WHERE COALESCE(NULLIF(video_url, ''), '') <> ''
    AND COALESCE(NULLIF(image_url, ''), NULLIF(thumbnail, ''), '') = ''
)
UPDATE public.courses AS c
SET
  image_url = CASE target_courses.rn
    WHEN 1 THEN '/course-covers/01.png'
    WHEN 2 THEN '/course-covers/02.png'
    WHEN 3 THEN '/course-covers/03.png'
    ELSE c.image_url
  END,
  thumbnail = CASE target_courses.rn
    WHEN 1 THEN '/course-covers/01.png'
    WHEN 2 THEN '/course-covers/02.png'
    WHEN 3 THEN '/course-covers/03.png'
    ELSE c.thumbnail
  END,
  updated_at = NOW()
FROM target_courses
WHERE c.id = target_courses.id
  AND target_courses.rn <= 3;
