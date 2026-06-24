-- 扩展视频课程展示封面到 11 张
-- 会覆盖已经使用 /course-covers/*.png 的课程封面，并继续补更多无图视频课程

ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS thumbnail TEXT;

WITH target_courses AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY created_at ASC NULLS LAST, id) AS rn
  FROM public.courses
  WHERE COALESCE(NULLIF(video_url, ''), '') <> ''
    AND (
      COALESCE(NULLIF(image_url, ''), NULLIF(thumbnail, ''), '') = ''
      OR image_url LIKE '/course-covers/%'
      OR thumbnail LIKE '/course-covers/%'
    )
)
UPDATE public.courses AS c
SET
  image_url = CASE target_courses.rn
    WHEN 1 THEN '/course-covers/01.png'
    WHEN 2 THEN '/course-covers/02.png'
    WHEN 3 THEN '/course-covers/03.png'
    WHEN 4 THEN '/course-covers/04.png'
    WHEN 5 THEN '/course-covers/05.png'
    WHEN 6 THEN '/course-covers/06.png'
    WHEN 7 THEN '/course-covers/07.png'
    WHEN 8 THEN '/course-covers/08.png'
    WHEN 9 THEN '/course-covers/09.png'
    WHEN 10 THEN '/course-covers/10.png'
    WHEN 11 THEN '/course-covers/11.png'
    ELSE c.image_url
  END,
  thumbnail = CASE target_courses.rn
    WHEN 1 THEN '/course-covers/01.png'
    WHEN 2 THEN '/course-covers/02.png'
    WHEN 3 THEN '/course-covers/03.png'
    WHEN 4 THEN '/course-covers/04.png'
    WHEN 5 THEN '/course-covers/05.png'
    WHEN 6 THEN '/course-covers/06.png'
    WHEN 7 THEN '/course-covers/07.png'
    WHEN 8 THEN '/course-covers/08.png'
    WHEN 9 THEN '/course-covers/09.png'
    WHEN 10 THEN '/course-covers/10.png'
    WHEN 11 THEN '/course-covers/11.png'
    ELSE c.thumbnail
  END,
  updated_at = NOW()
FROM target_courses
WHERE c.id = target_courses.id
  AND target_courses.rn <= 11;
