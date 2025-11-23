-- ============================================
-- 点赞和评论功能数据库设计
-- 创建时间: 2025-11-23
-- 说明: 支持产品、课程、文章的点赞和评论功能
-- ============================================

BEGIN;

-- ============================================
-- 1. 点赞表 (likes)
-- ============================================

-- 创建点赞表
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- 内容类型和ID（支持多种类型）
  item_type TEXT NOT NULL CHECK (item_type IN ('product', 'course', 'article')),
  item_id TEXT NOT NULL,
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 唯一约束：每个用户对每个项目只能点赞一次
  UNIQUE(user_id, item_type, item_id)
);

-- 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_item_type_item_id ON public.likes(item_type, item_id);
CREATE INDEX IF NOT EXISTS idx_likes_created_at ON public.likes(created_at DESC);

-- 添加注释
COMMENT ON TABLE public.likes IS '点赞表 - 存储用户对产品、课程、文章的点赞记录';
COMMENT ON COLUMN public.likes.item_type IS '内容类型: product(产品), course(课程), article(文章)';
COMMENT ON COLUMN public.likes.item_id IS '对应内容的ID（支持UUID、字符串等各种格式）';

-- ============================================
-- 2. 评论表 (comments)
-- ============================================

-- 创建评论表
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- 内容类型和ID
  item_type TEXT NOT NULL CHECK (item_type IN ('product', 'course', 'article')),
  item_id TEXT NOT NULL,
  
  -- 评论内容
  content TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 2000),
  
  -- 父评论ID（用于回复功能，可为空表示顶级评论）
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  
  -- 评论状态
  status TEXT DEFAULT 'published' CHECK (status IN ('published', 'hidden', 'deleted')),
  
  -- 点赞数（冗余字段，提高查询性能）
  likes_count INTEGER DEFAULT 0 CHECK (likes_count >= 0),
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_item_type_item_id ON public.comments(item_type, item_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON public.comments(status);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at DESC);

-- 添加注释
COMMENT ON TABLE public.comments IS '评论表 - 存储用户对产品、课程、文章的评论';
COMMENT ON COLUMN public.comments.parent_id IS '父评论ID - NULL表示顶级评论，有值表示回复';
COMMENT ON COLUMN public.comments.status IS '评论状态 - published(已发布), hidden(隐藏), deleted(已删除)';
COMMENT ON COLUMN public.comments.likes_count IS '评论获赞数 - 冗余字段用于排序';

-- ============================================
-- 3. 评论点赞表 (comment_likes)
-- ============================================

-- 创建评论点赞表（用于给评论点赞）
CREATE TABLE IF NOT EXISTS public.comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 唯一约束
  UNIQUE(user_id, comment_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON public.comment_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON public.comment_likes(comment_id);

COMMENT ON TABLE public.comment_likes IS '评论点赞表 - 存储用户对评论的点赞';

-- ============================================
-- 4. 触发器：更新评论点赞数
-- ============================================

-- 创建更新评论点赞数的函数
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- 插入点赞时，增加评论点赞数
    UPDATE public.comments
    SET likes_count = likes_count + 1
    WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- 删除点赞时，减少评论点赞数
    UPDATE public.comments
    SET likes_count = GREATEST(0, likes_count - 1)
    WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DROP TRIGGER IF EXISTS trigger_update_comment_likes_count ON public.comment_likes;
CREATE TRIGGER trigger_update_comment_likes_count
  AFTER INSERT OR DELETE ON public.comment_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_likes_count();

-- ============================================
-- 5. 触发器：更新评论时间
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_comments_timestamp ON public.comments;
CREATE TRIGGER trigger_update_comments_timestamp
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. 行级安全策略 (RLS)
-- ============================================

-- 启用RLS
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- ====== likes 表策略 ======

-- 所有人可以查看点赞（用于显示点赞数）
CREATE POLICY "Anyone can view likes"
  ON public.likes
  FOR SELECT
  USING (true);

-- 用户可以添加自己的点赞
CREATE POLICY "Users can insert own likes"
  ON public.likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用户可以删除自己的点赞
CREATE POLICY "Users can delete own likes"
  ON public.likes
  FOR DELETE
  USING (auth.uid() = user_id);

-- ====== comments 表策略 ======

-- 所有人可以查看已发布的评论
CREATE POLICY "Anyone can view published comments"
  ON public.comments
  FOR SELECT
  USING (status = 'published');

-- 用户可以添加评论
CREATE POLICY "Authenticated users can insert comments"
  ON public.comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- 用户可以更新自己的评论
CREATE POLICY "Users can update own comments"
  ON public.comments
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 用户可以删除自己的评论
CREATE POLICY "Users can delete own comments"
  ON public.comments
  FOR DELETE
  USING (auth.uid() = user_id);

-- ====== comment_likes 表策略 ======

-- 所有人可以查看评论点赞
CREATE POLICY "Anyone can view comment likes"
  ON public.comment_likes
  FOR SELECT
  USING (true);

-- 用户可以添加评论点赞
CREATE POLICY "Users can insert comment likes"
  ON public.comment_likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用户可以删除自己的评论点赞
CREATE POLICY "Users can delete own comment likes"
  ON public.comment_likes
  FOR DELETE
  USING (auth.uid() = user_id);

COMMIT;

-- ============================================
-- 7. 验证脚本
-- ============================================

-- 验证表是否创建成功
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('likes', 'comments', 'comment_likes')
ORDER BY table_name;

-- 验证RLS策略
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE tablename IN ('likes', 'comments', 'comment_likes')
ORDER BY tablename, policyname;

-- 验证索引
SELECT 
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public' 
  AND tablename IN ('likes', 'comments', 'comment_likes')
ORDER BY tablename, indexname;
