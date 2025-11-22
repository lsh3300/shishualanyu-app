-- 文化文章表结构
-- 在 Supabase SQL Editor 中执行

-- 1. 创建 culture_articles 表
CREATE TABLE IF NOT EXISTS public.culture_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  category TEXT NOT NULL DEFAULT '历史',
  tags TEXT[] DEFAULT '{}',
  read_time INTEGER DEFAULT 5,
  author TEXT DEFAULT '世说蓝语',
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published',
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建更新时间戳触发器
CREATE OR REPLACE FUNCTION public.update_culture_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_culture_articles_updated_at ON public.culture_articles;
CREATE TRIGGER trigger_culture_articles_updated_at
  BEFORE UPDATE ON public.culture_articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_culture_articles_updated_at();

-- 3. 创建文章收藏表
CREATE TABLE IF NOT EXISTS public.article_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  article_id UUID NOT NULL REFERENCES public.culture_articles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

CREATE INDEX IF NOT EXISTS idx_article_favorites_user
  ON public.article_favorites(user_id);

CREATE INDEX IF NOT EXISTS idx_article_favorites_article
  ON public.article_favorites(article_id);

-- 4. 创建文章评论表
CREATE TABLE IF NOT EXISTS public.article_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.culture_articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name TEXT,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  parent_id UUID REFERENCES public.article_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_article_comments_article
  ON public.article_comments(article_id);

CREATE INDEX IF NOT EXISTS idx_article_comments_user
  ON public.article_comments(user_id);

-- 5. 创建索引优化查询
CREATE INDEX IF NOT EXISTS idx_culture_articles_slug
  ON public.culture_articles(slug);

CREATE INDEX IF NOT EXISTS idx_culture_articles_category
  ON public.culture_articles(category);

CREATE INDEX IF NOT EXISTS idx_culture_articles_status
  ON public.culture_articles(status);

CREATE INDEX IF NOT EXISTS idx_culture_articles_created
  ON public.culture_articles(created_at DESC);

-- 6. 行级安全策略
ALTER TABLE public.culture_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_comments ENABLE ROW LEVEL SECURITY;

-- 文章：所有人可读
DROP POLICY IF EXISTS "Public read culture articles" ON public.culture_articles;
CREATE POLICY "Public read culture articles"
  ON public.culture_articles
  FOR SELECT
  USING (status = 'published');

-- 文章：服务角色可写
DROP POLICY IF EXISTS "Service manage articles" ON public.culture_articles;
CREATE POLICY "Service manage articles"
  ON public.culture_articles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 收藏：用户可读自己的
DROP POLICY IF EXISTS "Users read own favorites" ON public.article_favorites;
CREATE POLICY "Users read own favorites"
  ON public.article_favorites
  FOR SELECT
  USING (auth.uid() = user_id);

-- 收藏：用户可插入自己的
DROP POLICY IF EXISTS "Users insert own favorites" ON public.article_favorites;
CREATE POLICY "Users insert own favorites"
  ON public.article_favorites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 收藏：用户可删除自己的
DROP POLICY IF EXISTS "Users delete own favorites" ON public.article_favorites;
CREATE POLICY "Users delete own favorites"
  ON public.article_favorites
  FOR DELETE
  USING (auth.uid() = user_id);

-- 评论：所有人可读
DROP POLICY IF EXISTS "Public read comments" ON public.article_comments;
CREATE POLICY "Public read comments"
  ON public.article_comments
  FOR SELECT
  USING (true);

-- 评论：认证用户可插入
DROP POLICY IF EXISTS "Authenticated insert comments" ON public.article_comments;
CREATE POLICY "Authenticated insert comments"
  ON public.article_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 评论：用户可更新/删除自己的
DROP POLICY IF EXISTS "Users manage own comments" ON public.article_comments;
CREATE POLICY "Users manage own comments"
  ON public.article_comments
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own comments" ON public.article_comments;
CREATE POLICY "Users delete own comments"
  ON public.article_comments
  FOR DELETE
  USING (auth.uid() = user_id);
