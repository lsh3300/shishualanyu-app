-- 用户成就系统数据库表 (修复版)
-- 执行时间: 2025-11-27

-- ============================================
-- 0. 创建 updated_at 触发器函数 (如果不存在)
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 1. 课程注册表 (enrollments)
-- ============================================
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'dropped')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_status ON enrollments(user_id, status);

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own enrollments" ON enrollments;
CREATE POLICY "Users can view own enrollments" 
  ON enrollments FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own enrollments" ON enrollments;
CREATE POLICY "Users can insert own enrollments" 
  ON enrollments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own enrollments" ON enrollments;
CREATE POLICY "Users can update own enrollments" 
  ON enrollments FOR UPDATE 
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_enrollments_updated_at ON enrollments;
CREATE TRIGGER update_enrollments_updated_at 
  BEFORE UPDATE ON enrollments 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 2. 课程点赞表 (course_likes)
-- ============================================
CREATE TABLE IF NOT EXISTS course_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_course_likes_user_id ON course_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_course_likes_course_id ON course_likes(course_id);

ALTER TABLE course_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view course likes" ON course_likes;
CREATE POLICY "Anyone can view course likes" 
  ON course_likes FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Users can insert own likes" ON course_likes;
CREATE POLICY "Users can insert own likes" 
  ON course_likes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own likes" ON course_likes;
CREATE POLICY "Users can delete own likes" 
  ON course_likes FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================
-- 3. 课程评论表 (course_comments)
-- ============================================
CREATE TABLE IF NOT EXISTS course_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL CHECK (length(content) > 0 AND length(content) <= 500),
  likes_count INTEGER DEFAULT 0 CHECK (likes_count >= 0),
  parent_id UUID REFERENCES course_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_course_comments_user_id ON course_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_comments_course_id ON course_comments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_comments_parent_id ON course_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_course_comments_created_at ON course_comments(created_at DESC);

ALTER TABLE course_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view comments" ON course_comments;
CREATE POLICY "Anyone can view comments" 
  ON course_comments FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert comments" ON course_comments;
CREATE POLICY "Authenticated users can insert comments" 
  ON course_comments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own comments" ON course_comments;
CREATE POLICY "Users can update own comments" 
  ON course_comments FOR UPDATE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON course_comments;
CREATE POLICY "Users can delete own comments" 
  ON course_comments FOR DELETE 
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_course_comments_updated_at ON course_comments;
CREATE TRIGGER update_course_comments_updated_at 
  BEFORE UPDATE ON course_comments 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. 评论点赞表 (comment_likes)
-- ============================================
CREATE TABLE IF NOT EXISTS comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  comment_id UUID REFERENCES course_comments(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, comment_id)
);

CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON comment_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);

ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view comment likes" ON comment_likes;
CREATE POLICY "Anyone can view comment likes" 
  ON comment_likes FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Users can insert own comment likes" ON comment_likes;
CREATE POLICY "Users can insert own comment likes" 
  ON comment_likes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own comment likes" ON comment_likes;
CREATE POLICY "Users can delete own comment likes" 
  ON comment_likes FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================
-- 5. 触发器：更新评论点赞数
-- ============================================
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE course_comments 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE course_comments 
    SET likes_count = GREATEST(likes_count - 1, 0) 
    WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_comment_likes_count ON comment_likes;
CREATE TRIGGER trigger_update_comment_likes_count
  AFTER INSERT OR DELETE ON comment_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_likes_count();

-- ============================================
-- 6. 视图：用户学习统计
-- ============================================
CREATE OR REPLACE VIEW user_learning_stats AS
SELECT 
  user_id,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_courses,
  COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_courses,
  COUNT(DISTINCT DATE(last_accessed_at)) as learning_days,
  MAX(last_accessed_at) as last_learning_date,
  MIN(started_at) as first_learning_date
FROM enrollments
GROUP BY user_id;

-- ============================================
-- 7. 视图：用户互动统计
-- ============================================
CREATE OR REPLACE VIEW user_engagement_stats AS
SELECT 
  u.id as user_id,
  COALESCE(l.likes_count, 0) as total_likes,
  COALESCE(c.comments_count, 0) as total_comments,
  COALESCE(l.likes_count, 0) + COALESCE(c.comments_count, 0) as total_engagements
FROM auth.users u
LEFT JOIN (
  SELECT user_id, COUNT(*) as likes_count 
  FROM course_likes 
  GROUP BY user_id
) l ON u.id = l.user_id
LEFT JOIN (
  SELECT user_id, COUNT(*) as comments_count 
  FROM course_comments 
  GROUP BY user_id
) c ON u.id = c.user_id;

-- ============================================
-- 8. 函数：获取用户成就数据
-- ============================================
CREATE OR REPLACE FUNCTION get_user_achievements(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'user_id', p_user_id,
    'completed_courses', COALESCE(ls.completed_courses, 0),
    'in_progress_courses', COALESCE(ls.in_progress_courses, 0),
    'learning_days', COALESCE(ls.learning_days, 0),
    'total_likes', COALESCE(es.total_likes, 0),
    'total_comments', COALESCE(es.total_comments, 0),
    'total_engagements', COALESCE(es.total_engagements, 0),
    'first_learning_date', ls.first_learning_date,
    'last_learning_date', ls.last_learning_date
  ) INTO v_result
  FROM auth.users u
  LEFT JOIN user_learning_stats ls ON u.id = ls.user_id
  LEFT JOIN user_engagement_stats es ON u.id = es.user_id
  WHERE u.id = p_user_id;
  
  RETURN COALESCE(v_result, json_build_object(
    'user_id', p_user_id,
    'completed_courses', 0,
    'in_progress_courses', 0,
    'learning_days', 0,
    'total_likes', 0,
    'total_comments', 0,
    'total_engagements', 0
  ));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 完成
-- ============================================
COMMENT ON TABLE enrollments IS '课程注册表 - 记录用户学习的课程';
COMMENT ON TABLE course_likes IS '课程点赞表 - 记录用户对课程的点赞';
COMMENT ON TABLE course_comments IS '课程评论表 - 记录用户的课程评论';
COMMENT ON TABLE comment_likes IS '评论点赞表 - 记录用户对评论的点赞';

-- 验证安装
DO $$
BEGIN
  RAISE NOTICE '✅ 用户成就系统数据库安装完成！';
  RAISE NOTICE '📊 已创建 4 个表: enrollments, course_likes, course_comments, comment_likes';
  RAISE NOTICE '🔒 已配置 RLS 安全策略';
  RAISE NOTICE '📈 已创建 2 个视图和 1 个统计函数';
  RAISE NOTICE '🎉 系统就绪，可以开始使用！';
END $$;
